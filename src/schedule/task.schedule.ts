import cron from 'node-cron';
import NotificationModel from '../models/notification.model';
//delete notification 
export const notificationTask = cron.schedule("0 0 0 * * *", async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await NotificationModel.deleteMany({ status: 'raed', createdAt: { $lt: thirtyDaysAgo } })
    console.log("Deleted read notifications");
})
