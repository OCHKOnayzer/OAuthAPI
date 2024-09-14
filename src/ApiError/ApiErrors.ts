class ApiError extends Error {
    status: number;
    errors: string[];

    constructor(status: number, message: string, errors: string[] = []) {
        super(message);
        this.status = status;
        this.errors = errors;
        this.name = 'ApiError';
        Error.captureStackTrace(this, this.constructor);
    }

    static UnauthorizedError(): ApiError {
        return new ApiError(401, 'Пользователь не авторизован');
    }

    static BadRequest(message: string, errors: string[] = []): ApiError {
        return new ApiError(400, message, errors);
    }

    static NotFoundError(message: string = 'Ресурс не найден'): ApiError {
        return new ApiError(404, message);
    }

    static ServerError(message: string = 'Непредвиденная ошибка'): ApiError {
        return new ApiError(500, message);
    }
}

export default ApiError;
