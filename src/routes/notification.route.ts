import express from 'express';
import { authorizeRoles, isAuthenticated } from '../api/middleware/auth';
import { getNotifications, updateNotification } from '../api/controllers/notification.controller';
import { asyncHandler } from '../helper/asyncHandler';
const router = express.Router();

router.get('/get-notifications', isAuthenticated, authorizeRoles('admin'), asyncHandler(getNotifications))

router.put('/update-notification/:id', isAuthenticated, authorizeRoles('admin'), asyncHandler(updateNotification))

export default router;