import { Request, Response, NextFunction } from 'express';
import ApiError from '../ApiError/ApiErrors';

function errorMiddleware(err: ApiError, req: Request, res: Response, next: NextFunction) {
    const status = err.status || 500;
    const message = err.message || 'Внутренняя ошибка сервера';
    const errors = err.errors || [];

    res.status(status).json({
        status,
        message,
        errors,
    });
}

export default errorMiddleware;
