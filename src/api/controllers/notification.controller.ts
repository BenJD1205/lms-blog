import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../errors/errorHandler";
import { findNotification, findAllNotifications } from "../../services/notification.service";

const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const notifications = await findAllNotifications();
        res.status(200).json({
            success: true,
            data: notifications,
        })
    }
    catch (err) {
        next(err);
    }
}

//Update notifications status 
const updateNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const notification = await findNotification(req.params.id);
        if (!notification) return next(new ErrorHandler("Notification not found", 404))
        notification.status ? notification.status = 'read' : notification.status
        await notification.save()
        const notifications = await findAllNotifications()

        res.status(201).json({
            success: true,
            data: notifications,
        })
    }
    catch (err) {
        next(err);
    }
}



export {
    getNotifications,
    updateNotification
}