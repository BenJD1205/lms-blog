import express from 'express';
import userRouter from './user.route';
import courseRouter from './course.route';
import orderRouter from './order.route';
import notificationRouter from './notification.route';
import analyticsRouter from './analytics.route';
import layoutRouter from './layout.route';
const router = express.Router();

router.use('/user', userRouter);
router.use('/course', courseRouter);
router.use('/order', orderRouter);
router.use('/notification', notificationRouter);
router.use('/analytics', analyticsRouter);
router.use('/layout', layoutRouter);

export default router;