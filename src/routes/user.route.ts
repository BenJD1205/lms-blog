import express from 'express';
import { register, activeUser, login,getUsers } from '../api/controllers/user.controller';
import { asyncHandler } from '../helper/asyncHandler';
const router = express.Router();

//register
router.post('/register', asyncHandler(register));

//login
router.post('/login', asyncHandler(login));

//active-user
router.post('/active-user', asyncHandler(activeUser));

//get all users
router.get('/', asyncHandler(getUsers));

export default router;