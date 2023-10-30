import express from 'express'
import {
    uploadCourse,
    editCourse,
    getACourse,
    getAllCourse,
    getCourseByUser,
    addQuestion,
    addAnswer,
    addReview,
    addReplyToReview,
    deleteCourse,
} from '../api/controllers/course.controller'
import { isAuthenticated, authorizeRoles } from '../api/middleware/auth'
import { asyncHandler } from '../helper/asyncHandler'
const router = express.Router()

router.get('/get-courses', asyncHandler(getAllCourse))

router.get(
    '/get-course-content/:id',
    isAuthenticated,
    asyncHandler(getCourseByUser)
)

router.get('/:id', asyncHandler(getACourse))

router.post(
    '/create',
    isAuthenticated,
    authorizeRoles('admin'),
    asyncHandler(uploadCourse)
)

router.put(
    '/edit/:id',
    isAuthenticated,
    authorizeRoles('admin'),
    asyncHandler(editCourse)
)

router.put('/add-question', isAuthenticated, asyncHandler(addQuestion))

router.put('/add-answer', isAuthenticated, asyncHandler(addAnswer))

router.put('/add-review/:id', isAuthenticated, asyncHandler(addReview))

router.put("/add-reply", isAuthenticated, authorizeRoles("admin"), asyncHandler(addReplyToReview))

router.delete("/delete-course", isAuthenticated, authorizeRoles("admin"), asyncHandler(deleteCourse))


export default router
