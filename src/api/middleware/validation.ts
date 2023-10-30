
import { Response, Request, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import Joi from 'joi';

type SchemaValidationMiddleware = {
    querySchema?: Joi.Schema;
    paramsSchema?: Joi.Schema;
    bodySchema?: Joi.Schema;
};

const validationMiddleware = ({ querySchema, paramsSchema, bodySchema }: SchemaValidationMiddleware) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error: queryError } = (querySchema && querySchema.validate(req['query'])) || {};
        const { error: paramsError } = (paramsSchema && paramsSchema.validate(req['params'])) || {};
        const { error: bodyError } = (bodySchema && bodySchema.validate(req['body'])) || {};

        const valid = !queryError && !paramsError && !bodyError;

        if (valid) {
            next();
        } else {
            const { details: queryErrorDetails } = queryError || {};
            const { details: paramsErrorDetails } = paramsError || {};
            const { details: bodyErrorDetails } = bodyError || {};

            const simplifiedMessage = (
                (queryErrorDetails && queryErrorDetails[0]) ||
                (paramsErrorDetails && paramsErrorDetails[0]) ||
                (bodyErrorDetails && bodyErrorDetails[0])
            ).message.replace(/"/g, '');

            res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
                message: simplifiedMessage,
                data: null
            })
        }
    };
};

export default validationMiddleware;
