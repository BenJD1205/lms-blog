import { Response } from "express";
import OrderModel from "../models/order.model";

//create new order
export const newOrder = async (data: any, res: Response) => {
    const order = await OrderModel.create(data);
    res.status(201).json({
        success: true,
        data: order,
    })
}

export const findAllOrders = async () => {
    const courses = await OrderModel.find().sort({ createdAt: -1 })
    return courses
}