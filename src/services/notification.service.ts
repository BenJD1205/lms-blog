import { IUser } from './../models/user.model';
import NotificationModel from "../models/notification.model";

type createNotification = {
    user: IUser,
    course: any
}

//create notification
export const createNotification = async (payload: object) => {
    await NotificationModel.create(payload);
    return;
}

export const findNotification = async (id: string) => {
    const notification = await NotificationModel.findById(id);
    return notification;
}

export const findAllNotifications = async () => {
    const notifications = await NotificationModel.find().sort({ createdAt: -1 })
    return notifications
}