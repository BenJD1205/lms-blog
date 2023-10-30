import express from 'express';
import { createLayout, editLayout, getLayout } from '../api/controllers/layout.controller';
import { authorizeRoles, isAuthenticated } from '../api/middleware/auth';
import { asyncHandler } from '../helper/asyncHandler';
const router = express.Router();

router.post('/create-layout', isAuthenticated, authorizeRoles("admin"), asyncHandler(createLayout))

router.put('/edit-layout', isAuthenticated, authorizeRoles("admin"), asyncHandler(editLayout))

router.get('/get-layout', asyncHandler(getLayout))

export default router;