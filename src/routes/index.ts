import express from 'express';
import userRouter from './user.route';
import courseRouter from './course.route';
const router = express.Router();

router.use('/user', userRouter);
router.use('/course', courseRouter);

export default router;