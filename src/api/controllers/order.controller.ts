import { Request, Response, NextFunction } from 'express';
import ErrorHandler from '../errors/errorHandler';
import { IOrder } from '../../models/order.model';
import path from 'path';
import ejs from 'ejs';
import { sendMail } from '../../utils/sendMail';
import { findUser } from '../../services/user.service';
import { findACourse } from '../../services/course.service';
import { findAllOrders, newOrder } from '../../services/order.service';
import { createNotification } from '../../services/notification.service';

//create order
const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { courseId, payment_info } = req.body as IOrder;
        const user = await findUser(req.user?._id)
        const courseExist = user?.courses.some((course: any) => course.courseId.toString() === courseId)
        if (courseExist) return next(new ErrorHandler("You have already purchased this course", 400))

        const course = await findACourse(courseId)

        if (!course) return next(new ErrorHandler("Course not found", 404))
        const data: any = {
            courseId: course._id,
            userId: user?._id,
            payment_info,
        }

        const mailData = {
            order: {
                _id: course._id.toString().slice(0, 6),
                name: course.name,
                price: course.price,
                date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            }
        }
        const html = await ejs.renderFile(path.join(__dirname, '../../mails/order-confirmation.ejs'), mailData)
        try {
            if (user) {
                await sendMail({
                    email: user.email,
                    subject: 'Order confirmation',
                    template: 'order-confirmation.ejs',
                    data: mailData,
                })
            }
        }
        catch (err) {
            return next(err);
        }

        user?.courses.push({ courseId: course?._id.toString() })

        await user?.save()

        //create notification
        await createNotification({
            user: user?._id,
            title: 'New order',
            message: `You have a new order from ${course?.name}`
        })

        course.purchased ? course.purchased += 1 : course.purchased

        await course.save();

        //create order
        newOrder(data, res);
    }
    catch (err) {
        next(err);
    }
}

const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courses = await findAllOrders();
        res.status(200).json({ success: true, data: courses });
    }
    catch (err) {
        next(err);
    }
}

export {
    createOrder,
    getAllOrders
}