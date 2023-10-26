import express from 'express';
import { uploadCourse, editCourse, getACourse, getAllCourse } from '../api/controllers/course.controller';
import { isAuthenticated, authorizeRoles } from '../api/middleware/auth';
import { asyncHandler } from '../helper/asyncHandler';
const router = express.Router()

router.post("/create", isAuthenticated, authorizeRoles("admin"), asyncHandler(uploadCourse))

router.put("/edit/:id", isAuthenticated, authorizeRoles("admin"), asyncHandler(editCourse))

router.put("/get/:id", asyncHandler(getACourse))

router.get("/get-all", asyncHandler(getAllCourse))

export default router;