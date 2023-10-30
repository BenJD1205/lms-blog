import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../errors/errorHandler";
import cloudinary from 'cloudinary';
import LayoutModel from "../../models/layout.model";

//create layout
const createLayout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type } = req.body;
        const isTypeExist = await LayoutModel.findOne({ type })
        if (isTypeExist) return next(new ErrorHandler(`${type} already exists`, 400));
        if (type === 'Banner') {
            const { image, title, subTitle } = req.body;
            const myCloud = await cloudinary.v2.uploader.upload(image, {
                folder: 'layout',
            })
            const banner = {
                type: "Banner",
                image: {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                },
                title,
                subTitle,
            }
            await LayoutModel.create(banner);
        }
        if (type === 'FAQ') {
            const { faq } = req.body;
            const faqItems = await Promise.all(faq.map(async (item: any) => {
                return {
                    question: item.question,
                    answer: item.answer,
                }
            }))
            await LayoutModel.create({ type: 'FAQ', faq: faqItems });
        }
        if (type === 'Categories') {
            const { categories } = req.body;
            const categoryItems = await Promise.all(categories.map(async (item: any) => {
                return {
                    title: item.title,
                }
            }))
            await LayoutModel.create({ type: 'Categories', categories: categoryItems });
        }

        res.status(201).json({
            success: true,
            message: 'Layout created successfully'
        })
    }
    catch (err) {
        next(err);
    }
}

//edit layout 
const editLayout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type } = req.body;
        if (type === 'Banner') {
            const { image, title, subTitle } = req.body;
            const bannerData: any = await LayoutModel.findOne({ type: 'Banner' })
            if (bannerData) {
                await cloudinary.v2.uploader.destroy(bannerData.image.public_id)
            }
            const myCloud = await cloudinary.v2.uploader.upload(image, {
                folder: 'layout',
            })
            const banner = {
                type: "Banner",
                image: {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                },
                title,
                subTitle,
            }
            await LayoutModel.findByIdAndUpdate(bannerData.id, { banner })
        }
        if (type === 'FAQ') {
            const { faq } = req.body;
            const FaqItem = await LayoutModel.findOne({ type: 'FAQ' })
            const faqItems = await Promise.all(faq.map(async (item: any) => {
                return {
                    question: item.question,
                    answer: item.answer,
                }
            }))
            await LayoutModel.findByIdAndUpdate(FaqItem?._id, { type: 'FAQ', faq: faqItems });
        }
        if (type === 'Categories') {
            const { categories } = req.body;
            const categoriesItem = await LayoutModel.findOne({ type: 'Categories' })
            const categoryItems = await Promise.all(categories.map(async (item: any) => {
                return {
                    title: item.title,
                }
            }))
            await LayoutModel.findByIdAndUpdate(categoriesItem?._id, { type: 'Categories', categories: categoryItems });
        }
        res.status(201).json({
            success: true,
            message: 'Layout updated successfully'
        })
    }
    catch (err) {
        next(err);
    }
}

//get layout
const getLayout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type } = req.body;
        const layout = await LayoutModel.findOne({ type });
        res.status(200).json({
            success: true,
            data: layout
        })
    }
    catch (err) {
        next(err);
    }
}

export {
    createLayout,
    editLayout,
    getLayout,
}
