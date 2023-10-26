import { Response } from "express";
import CourseModel from "../models/course.model";

//create course
const createCourse = async (data:any, res:Response) => {
    const course = await CourseModel.create(data);
    res.status(201).json({
        success:true,
        data:course
    })
}

export {
    createCourse,
}