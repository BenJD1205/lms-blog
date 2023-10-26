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
} from '../api/controllers/user.controller'
import { asyncHandler } from '../helper/asyncHandler'
import { isAuthenticated } from '../api/middleware/auth'
const router = express.Router()

//register
router.post('/register', asyncHandler(register))

//login
router.post('/login', asyncHandler(login))

//active-user
router.post('/active-user', asyncHandler(activeUser))

//social auth
router.post("/social-auth", asyncHandler(socialAuth))

//update user info
router.put("/update-profile", isAuthenticated ,asyncHandler(updateUserInfo))

//update user password
router.put("/update-password", isAuthenticated ,asyncHandler(updatePassword))

//update user avatar 
router.put("/update-avatar", isAuthenticated ,asyncHandler(updateProfilePicture))

//update token
router.get('/refresh-token', asyncHandler(updateAccessToken))

//get user profile 
router.get('/profile', isAuthenticated ,asyncHandler(getUserProfile))

//logout
router.get('/logout', isAuthenticated, asyncHandler(logout))

//get all users
router.get('/', isAuthenticated, asyncHandler(getUsers))

export default router
