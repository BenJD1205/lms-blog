import express from 'express'
import {
    register,
    activeUser,
    login,
    getUsers,
    logout,
    updateAccessToken,
    getUserProfile,
    socialAuth,
    updateUserInfo,
    updatePassword,
    updateProfilePicture,
    updateUserRole,
    deleteUser,
} from '../api/controllers/user.controller'
import { asyncHandler } from '../helper/asyncHandler'
import { authorizeRoles, isAuthenticated } from '../api/middleware/auth'
import validationMiddleware from '../api/middleware/validation'
import userSchema from '../api/validation/user-schema'
const router = express.Router()

//update token
router.get('/refresh-token', asyncHandler(updateAccessToken))

//get user profile
router.get('/profile', isAuthenticated, asyncHandler(getUserProfile))

//logout
router.get('/logout', isAuthenticated, asyncHandler(logout))

//get all users
router.get('/get-users', isAuthenticated, asyncHandler(getUsers))

//register
router.post(
    '/register',
    validationMiddleware({
        bodySchema: userSchema.registerBody,
    }),
    asyncHandler(register)
)

//login
router.post('/login', asyncHandler(login))

//active-user
router.post('/active-user', asyncHandler(activeUser))

//social auth
router.post('/social-auth', asyncHandler(socialAuth))

//update user info
router.put(
    '/update-profile',
    isAuthenticated,
    validationMiddleware({
        bodySchema: userSchema.updateProfile,
    }),
    asyncHandler(updateUserInfo)
)

//update user password
router.put('/update-password', isAuthenticated, asyncHandler(updatePassword))

//update user avatar
router.put(
    '/update-avatar',
    isAuthenticated,
    asyncHandler(updateProfilePicture)
)

router.put(
    '/update-role',
    isAuthenticated,
    authorizeRoles('admin'),
    validationMiddleware({
        bodySchema: userSchema.updateUserRole
    }),
    asyncHandler(updateUserRole)
)

router.delete("/delete-user/:id", isAuthenticated, authorizeRoles('admin'), asyncHandler(deleteUser))

export default router
