import { NextFunction, Request, Response } from "express";
import cloudinary from "cloudinary";
import courseModel from '../../models/course.model'
import { createCourse } from "../../services/course.service";
import { redis } from "../../db/redis";

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
        const course = await courseModel.findById(req.params.id).select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links")
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

export {
    uploadCourse,
    editCourse,
    getACourse,
    getAllCourse,
}