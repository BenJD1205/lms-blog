import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser  from 'cookie-parser';
import routes from './routes';
import { limiter } from './api/middleware/rate-limiter';
export const app = express();

//middleware
app.use(helmet());
app.use(express.json({limit:'50mb'}))
app.use(cookieParser());
app.use(cors({
    origin: '*'
}));

//middleware limiter IP
app.use(limiter);

//routes
app.use('/api/v1', routes);

//handle error
app.use('*', (req: Request ,res: Response, next: NextFunction) => {
    const err = new Error(`Route ${req.originalUrl} not found`) as any;
    err.statusCode = 404;
    next(err);
})

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.status || 500;
    return res.status(statusCode).json({
        status: "error",
        code: statusCode,
        stack: err.stack,
        message: err.message || "Internal Server Error",
    });
});