import { Response } from "express";
import userModel from "../models/user.model";
import { redis } from "../db/redis";

//get user id 
export const getUserById = async (id: string, res: Response) => {
    const userJson = await redis.get(id);

    if (userJson) {
        const user = JSON.parse(userJson);
        res.status(201).json({
            success: true,
            data: user,
        })
    }
}

//find by user
export const findUser = async (userId: string) => {
    const users = await userModel.findById(userId)
    return users;
}

//find all user
export const findAllUser = async () => {
    const user = await userModel.find().sort({ createdAt: -1 })
    return user;
}

interface IUserRole {
    id: string;
    role: string;
}

//update role
export const updateRole = async ({ id, role }: IUserRole) => {
    const user = await userModel.findByIdAndUpdate(id, { role }, { new: true })
    return user;
}