import { Response, Request, NextFunction } from 'express'
import jwt, { JwtPayload, Secret } from 'jsonwebtoken'
import ejs from 'ejs'
import path from 'path'
import { sendMail } from '../../utils/sendMail'
import userModel, { IUser } from '../../models/user.model'
import ErrorHandler from '../errors/errorHandler'
import { sendToken } from '../../helper/jwt'
import { redis } from '../../db/redis'
import { accessTokenOptions, refreshTokenOptions } from '../../helper/jwt'
import { getUserById } from '../../services/user.service'

//register interface
interface IRegistrationBody {
    name: string
    email: string
    password: string
    avatar?: string
}

const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = req.body
        const userExist = await userModel.findOne({ email })
        if (userExist) {
            return next(new ErrorHandler('Email already exist!', 400))
        }
        const user: IRegistrationBody = {
            name,
            email,
            password,
        }
        const { activationCode, token } = createActivationToken(user)
        const data = { user: { name: user.name }, activationCode }
        // const html = await ejs.renderFile(path.join(__dirname, ""))
        try {
            await sendMail({
                email: user.email,
                subject: 'Activate your account',
                template: 'activate-mail.ejs',
                data,
            })
            res.status(201).json({
                success: true,
                message: `Please check your ${user.email} to activate your account`,
                activationToken: token,
            })
        } catch (err) {
            next(err)
        }
    } catch (err) {
        next(err)
    }
}

//active token
interface IActivationToken {
    token: string
    activationCode: string
}

const createActivationToken = (user: any): IActivationToken => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString()

    const token = jwt.sign(
        {
            user,
            activationCode,
        },
        process.env.JWT_SECRET as Secret,
        {
            expiresIn: '5m',
        }
    )
    return { token, activationCode }
}

//activate user
interface IActivationRequest {
    activation_token: string
    activation_code: string
}

const activeUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { activation_code, activation_token } =
            req.body as IActivationRequest
        const newUser: { user: IUser; activationCode: string } = jwt.verify(
            activation_token,
            process.env.JWT_SECRET as string
        ) as { user: IUser; activationCode: string }

        if (newUser.activationCode !== activation_code) {
            return next(new ErrorHandler('Invalid activation code', 400))
        }

        const { name, email, password } = newUser.user
        const existUser = await userModel.findOne({ email })
        if (existUser) return next(new ErrorHandler('User already exists', 400))
        const user = await userModel.create({
            name,
            email,
            password,
        })
        res.json({
            success: true,
        })
    } catch (err) {
        next(err)
    }
}

interface ILoginRequest {
    email: string
    password: string
}

const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body as ILoginRequest
        if (!email || !password)
            return next(
                new ErrorHandler('Please enter a valid email or password', 400)
            )
        const user = await userModel.findOne({ email: email })
        if (!user)
            return next(new ErrorHandler('Invalid username or password', 400))
        const isPasswordMatch = await user.comparePassword(password)
        if (!isPasswordMatch)
            return next(new ErrorHandler('Invalid username or password', 400))
        sendToken(user, 200, res)
    } catch (err) {
        next(err)
    }
}

/*
 * logout user
 */
const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.cookie('access_token', '', { maxAge: 1 })
        res.cookie('refresh_token', '', { maxAge: 1 })
        const userId = req.user?._id || ''

        redis.del(userId)
        res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        })
    } catch (err) {
        next(err)
    }
}
/*
 * update access token
 */
export const updateAccessToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const refresh_token = req.cookies.refresh_token as string
        const decoded = jwt.verify(
            refresh_token,
            process.env.REFRESH_TOKEN_SECRET as string
        ) as JwtPayload
        const message = 'Could not refresh token'
        if(!decoded) return next(new ErrorHandler(message,400))
        const session = await redis.get(decoded.id as string)
        if(!session) return next(new ErrorHandler(message,400))

        const user = JSON.parse(session);
        const accessToken = jwt.sign({id:user._id}, process.env.ACCESS_TOKEN as string, {
            expiresIn:"5m"
        })
        const refreshToken = jwt.sign({id:user._id}, process.env.REFRESH_TOKEN as string,{
            expiresIn:"3d"
        })

        res.cookie("access_token",accessToken,accessTokenOptions);
        res.cookie("refresh_token",refreshToken,refreshTokenOptions);

        res.status(200).json({
            status:"success",
            accessToken,
        })
    } catch (err) {
        next(err)
    }
}

/*
 * get profile
 */
const getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?._id;
        getUserById(userId, res)
    } catch (err) {
        next(err)
    }
}

/*
 * get users
 */
const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await userModel.find()
        res.json({
            success: true,
            data: users,
        })
    } catch (err) {
        next(err)
    }
}

interface ISocialAuthBody{
    email:string;
    name:string;
    avatar:string;
}

/*
 * social auth
 */
const socialAuth = async (req:Request, res:Response, next:NextFunction) => {
    try{
        const {email, name,avatar}  = req.body as ISocialAuthBody;
        const user = await userModel.findOne({email});
        if(!user){
            const newUser = await userModel.create({email,name, avatar});
            sendToken(newUser, 200, res);
        }else{
            sendToken(user,200,res);
        }
    }
    catch(err){
        next(err);
    }
}

interface IUpdateUserInfo{
    name?:string;
    email?:string;
}

/*
 * update user info
 */
const updateUserInfo = async (req:Request, res:Response,next:NextFunction) => {
    try{
        const {name, email} = req.body as IUpdateUserInfo;
        const userId = req.user?._id;
        const user = await userModel.findById(userId);
        if(email && user){
            const isEmailExist = await userModel.findOne({email});
            if(isEmailExist) return next(new ErrorHandler("Email already exists",400))
            user.email = email;
        }

        if(name && user) user.name = name;

        await user?.save();

        await redis.set(userId, JSON.stringify(user))

        res.status(201).json({
            success:true,
            user,
        })
    }
    catch(err){
        next(err);
    }
}

export { register, login, activeUser, getUsers, logout, getUserProfile,  socialAuth, updateUserInfo}
