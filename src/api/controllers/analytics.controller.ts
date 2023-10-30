import { Request, Response, NextFunction } from "express";
import { generateLast12MothsData } from "../../utils/analytics.generator";
import userModel from "../../models/user.model";
import CourseModel from "../../models/course.model";
import OrderModel from "../../models/order.model";

export const getUserAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await generateLast12MothsData(userModel);
        res.status(200).json({
            success: true,
            data: users,
        })
    }
    catch (err) {
        next(err);
    }
}

export const getCourseAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courses = await generateLast12MothsData(CourseModel);
        res.status(200).json({
            success: true,
            data: courses,
        })
    }
    catch (err) {
        next(err);
    }
}

export const getOrderAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orders = await generateLast12MothsData(OrderModel);
        res.status(200).json({
            success: true,
            data: orders,
        })
    }
    catch (err) {
        next(err);
    }
}