import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../../helper/asyncHandler";
import ErrorHandler from "../errors/errorHandler";
import jwt, {JwtPayload} from 'jsonwebtoken';
import {redis} from '../../db/redis';

/*
* Authenticated
*/
export const isAuthenticated = asyncHandler(async (req:Request, res:Response, next:NextFunction) => {
    const access_token = req.cookies.access_token;

    if(!access_token) return next(new ErrorHandler("Authorization", 401))
    
    const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN as string) as JwtPayload

    if(!decoded) return next(new ErrorHandler("Access token is not valid",401))

    const user = await redis.get(decoded.id);

    if(!user) return next(new ErrorHandler("user not found", 400))

    req.user = JSON.parse(user);

    next();
})

/*
* valid user role
*/

export const authorizeRoles = (...roles:string[]) => {
    return (req:Request, res:Response, next:NextFunction) => {
        if(!roles.includes(req.user?.role || '')){
            return next(new ErrorHandler(`Role: ${req.user?.role} is not allowed to acess this resource`,403));
        }
        next();
    }
}