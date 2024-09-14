import Joi from 'joi';

export const createUserSchema = Joi.object({
    username: Joi.string().trim().min(5).required().messages({
        'string.empty': 'Введите имя пользователя.',
        'any.required': 'Имя пользователя обязательно для ввода.',
        'string.min': 'Имя пользователя должно быть не менее 5 символов.'
    }),
    password: Joi.string()
        .trim()
        .min(10)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=[\\]{};":\\\\|,.<>/?]).*$'))
        .required()
        .messages({
            'string.empty': 'Поле пароля не может быть пустым.',
            'any.required': 'Поле пароля обязательно для ввода.',
            'string.min': 'Пароль должен содержать минимум 10 символов.',
            'string.pattern.base': 'Пароль должен содержать минимум одну заглавную букву, одну строчную букву, одну цифру и один специальный символ.'
        }),
    email: Joi.string().trim().email().required().messages({
        'string.email': 'Введите действительный адрес электронной почты.',
        'any.required': 'Адрес электронной почты обязателен для ввода.'
    }),
});

export const AuthUserScheme = Joi.object({ 

    username: Joi.string().trim().min(5).required().messages({
        'string.empty': 'Введите имя пользователя.',
        'any.required': 'Имя пользователя обязательно для ввода.',
        'string.min': 'Имя пользователя должно быть не менее 5 символов.'
    }),
    password: Joi.string()
        .trim()
        .min(10)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=[\\]{};":\\\\|,.<>/?]).*$'))
        .required()
        .messages({
            'string.empty': 'Поле пароля не может быть пустым.',
            'any.required': 'Поле пароля обязательно для ввода.',
            'string.min': 'Пароль должен содержать минимум 10 символов.',
            'string.pattern.base': 'Пароль должен содержать минимум одну заглавную букву, одну строчную букву, одну цифру и один специальный символ.'
        })
})


export const updateUserScheme = Joi.object({
    username: Joi.string().trim().min(5).messages({
        'string.empty': 'Введите имя пользователя.',
        'any.required': 'Имя пользователя обязательно для ввода.',
        'string.min': 'Имя пользователя должно быть не менее 5 символов.'
    }),
    password: Joi.string()
        .trim()
        .min(10)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=[\\]{};":\\\\|,.<>/?]).*$'))
        .messages({
            'string.empty': 'Поле пароля не может быть пустым.',
            'any.required': 'Поле пароля обязательно для ввода.',
            'string.min': 'Пароль должен содержать минимум 10 символов.',
            'string.pattern.base': 'Пароль должен содержать минимум одну заглавную букву, одну строчную букву, одну цифру и один специальный символ.'
        }),
    email: Joi.string().trim().email().messages({
        'string.email': 'Введите действительный адрес электронной почты.',
        'any.required': 'Адрес электронной почты обязателен для ввода.'
    }),
    userId: Joi.string().required()
});