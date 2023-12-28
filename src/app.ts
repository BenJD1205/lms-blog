import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import compression from 'compression';
import routes from './routes';
import { limiter } from './api/middleware/rate-limiter';
import swagger from './document/swagger'
import { notificationTask } from './schedule/task.schedule';
export const app = express();

//middleware
app.use(helmet());
app.use(morgan("dev"));
app.use(compression());
app.use(express.json({ limit: '50mb' }))
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true,
}));

swagger(app);

//init cron task
notificationTask.start();

//middleware limiter IP
app.use(limiter);

//Define version 
const apiVersion = process.env.API_VERSION || '/api/v1';

//routes
app.use(apiVersion, routes);

//handle error
app.use('*', (req: Request, res: Response, next: NextFunction) => {
    const err = new Error(`Route ${req.originalUrl} not found`) as any;
    err.statusCode = 404;
    next(err);
})

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
        status: "error",
        code: statusCode,
        stack: err.stack,
        message: err.message || "Internal Server Error",
    });
});