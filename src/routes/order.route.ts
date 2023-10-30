import express from 'express'
import { isAuthenticated, authorizeRoles } from '../api/middleware/auth'
import { asyncHandler } from '../helper/asyncHandler'
import { createOrder, getAllOrders } from '../api/controllers/order.controller'
const router = express.Router()

router.get("/get-orders", isAuthenticated, authorizeRoles("admin"), asyncHandler(getAllOrders))

router.post('/create-order', isAuthenticated, asyncHandler(createOrder))

export default router;