import { NextFunction, Request, Response } from "express";
import cloudinary from "cloudinary";
import courseModel from '../../models/course.model'
import { createCourse, findACourse } from "../../services/course.service";
import { redis } from "../../db/redis";
import ErrorHandler from '../errors/errorHandler'
import mongoose from "mongoose";
import path from "path";
import ejs from 'ejs';
import { sendMail } from "../../utils/sendMail";
import { createNotification } from "../../services/notification.service";

//upload course 
const uploadCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        if (thumbnail) {
            const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: "course",
            });

            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            }
        }
        createCourse(data, res);
    }
    catch (err) {
        next(err);
    }
}

//edit course
const editCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;
        const courseId = req.params.id;

        const thumbnail = data.thumbnail;

        if (thumbnail) {
            await cloudinary.v2.uploader.destroy(thumbnail.public_id)
            const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: 'courses'
            })

            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }
        }

        const course = await courseModel.findByIdAndUpdate(courseId, {
            $set: data,
        }, {
            new: true
        })
        res.status(201).json({
            success: true,
            data: course
        })

    }
    catch (err) {
        next(err);
    }
}

//get single course
const getACourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courseId = req.params.id;
        const isCachedExist = await redis.get(courseId)
        if (isCachedExist) {
            const course = JSON.parse(isCachedExist);
            return res.status(200).json({
                success: true,
                data: course,
            })
        }
        const select = "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
        const course = await findACourse(courseId, select)
        await redis.set(courseId, JSON.stringify(course), "EX", 604776)
        res.status(200).json({
            success: true,
            data: course
        })
    }
    catch (err) {
        next(err);
    }
}

//get all courses
const getAllCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const isCourseExist = await redis.get("allCourses");
        if (isCourseExist) {
            const courses = JSON.parse(isCourseExist)
            return res.status(200).json({
                success: true,
                data: courses,
            })
        }
        const course = await courseModel.find().select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links")
        res.status(200).json({
            success: true,
            data: course
        })
    }
    catch (err) {
        next(err);
    }
}

//get course content - only valid user
export const getCourseByUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userCourseList = req.user?.courses;
        const courseId = req.params.id;

        const courseExist = userCourseList?.find((course: any) => course._id.toString() === courseId);
        if (!courseExist) return next(new ErrorHandler("You are not eligible to access this course", 400));
        const course = await findACourse(courseId);
        const content = course?.courseData;
        res.status(200).json({
            success: true,
            data: content,
        })
    }
    catch (err) {
        next(err);
    }
}

//add question in course
interface IAddQuestionData {
    question: string;
    courseId: string;
    contentId: string;
}

const addQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { question, courseId, contentId }: IAddQuestionData = req.body;
        const course = await findACourse(courseId);
        if (!mongoose.Types.ObjectId.isValid(contentId)) return next(new ErrorHandler("Invalid content id", 400))
        const courseContent = course?.courseData?.find((item: any) => item._id.equals(contentId))
        if (!courseContent) return next(new ErrorHandler("Invalid content id", 400))

        //create a new question object
        await createNotification({
            user: req.user?._id,
            title: 'New Question Received',
            message: `You have a new question in ${courseContent?.title}`
        })

        const newQuestion: any = {
            user: req.user,
            question,
            questionReplies: [],
        }

        //add this question to our course content
        courseContent.questions.push(newQuestion);

        //save the updated course 
        await course?.save();

        res.status(200).json({
            success: true,
            data: course,
        })
    }
    catch (err) {
        next(err);
    }
}

//add answer in course question
interface IAddAnswerData {
    answer: string;
    courseId: string;
    contentId: string;
    questionId: string;
}

const addAnswer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { answer, courseId, contentId, questionId }: IAddAnswerData = req.body;
        const course = await findACourse(courseId)
        if (!mongoose.Types.ObjectId.isValid(contentId)) return next(new ErrorHandler("Invalid content id", 400))
        const courseContent = course?.courseData?.find((item: any) => item._id.equals(contentId))
        if (!courseContent) return next(new ErrorHandler("Invalid content id", 400));
        const question = courseContent?.questions?.find((item: any) => item._id.equals(questionId))
        if (!question) return next(new ErrorHandler("Invalid question id", 400))
        //create a new answer object
        const newAnswer: any = {
            user: req.user,
            answer,
        }
        //add this answer to our course content
        question.questionReplies.push(newAnswer)

        await course?.save();

        if (req.user?._id === question.user._id) {
            //create a notification
            await createNotification({
                user: req.user?._id,
                title: 'New Question Reply Received',
                message: `You have a new question reply in ${courseContent.title}`
            })
        } else {
            const data = {
                name: question.user.name,
                title: courseContent.title,
            }
            const html = await ejs.renderFile(path.join(__dirname, '../mails/question-reply.ejs'), data);
            try {
                await sendMail({
                    email: question.user.email,
                    subject: 'Question Reply',
                    template: 'question-reply.ejs',
                    data
                })
            }
            catch (err) {
                next(err);
            }
        }
        res.status(200).json({
            success: true,
            data: course,
        })
    }
    catch (err) {
        next(err);
    }
}

//add review in course
interface IAddReviewData {
    review: string;
    rating: string;
    userId: string;
}

const addReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userCourseList = req.user?.courses;
        const courseId = req.params.id;

        //check if courseId already exists in userCourseList based on _id
        const courseExist = userCourseList?.some((course: any) => course._id.toString() === courseId);

        if (!courseExist) return next(new ErrorHandler("You are not eligible to access this course", 400))

        const course = await findACourse(courseId)
        const { review, rating, userId } = req.body as IAddReviewData;
        const reviewData: any = {
            user: req.user,
            rating,
            comment: review,
        }

        course?.reviews.push(reviewData);
        let avg = 0;
        course?.reviews.forEach((review) => {
            avg += review.rating;
        })
        if (course) {
            //one example we have 2 reviews one is 5 another one is 4 so math working like this (9 /2) =4.5 ratings
            course.ratings = avg / course.reviews.length
        }

        await course?.save()

        const notification = {
            title: `New Review Received`,
            message: `${req.user?.name} has given review in ${course?.name}`
        }
        //create notification

        res.status(200).json({
            success: true,
            data: course,
        })

    }
    catch (err) {
        next(err);
    }
}

//add reply in review
interface IAddReplyData {
    comment: string;
    courseId: string;
    reviewId: string;
}

const addReplyToReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { comment, courseId, reviewId } = req.body as IAddReplyData;
        const course = await findACourse(courseId);
        if (!course) return next(new ErrorHandler("You are not eligible to access this course", 400))
        const review: any = course?.reviews?.find((review: any) => review._id.toString() === reviewId)
        if (!review) return next(new ErrorHandler("Review not found", 400))
        const replyData: any = {
            user: req.user,
            comment,
        }
        if (!review.commentReplies) {
            review.commentReplies = [];
        }
        review.commentReplies?.push(replyData)

        await course?.save();

        res.status(200).json({
            success: true,
            data: course,
        })

    }
    catch (err) {
        next(err);
    }
}

const deleteCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const course = await findACourse(id);
        if (!course) return next(new ErrorHandler("Course not found", 404))
        await course.deleteOne({ id });
        await redis.del(id);
        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        })
    }
    catch (err) {
        next(err);
    }
}

export {
    uploadCourse,
    editCourse,
    getACourse,
    getAllCourse,
    addAnswer,
    addQuestion,
    addReview,
    addReplyToReview,
    deleteCourse,
}