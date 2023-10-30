import express from 'express';
import { getCourseAnalytics, getOrderAnalytics, getUserAnalytics } from '../api/controllers/analytics.controller';
import { authorizeRoles, isAuthenticated } from '../api/middleware/auth';
import { asyncHandler } from '../helper/asyncHandler';
const router = express.Router();

router.get("/get-user-analytics", isAuthenticated, authorizeRoles('admin'), asyncHandler(getUserAnalytics))

router.get("/get-course-analytics", isAuthenticated, authorizeRoles('admin'), asyncHandler(getCourseAnalytics))

router.get("/get-order-analytics", isAuthenticated, authorizeRoles('admin'), asyncHandler(getOrderAnalytics))

export default router;