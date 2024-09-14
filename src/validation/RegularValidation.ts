import Joi from "joi"

export const MethodUserIdOnly = Joi.object({ 
    userId: Joi.string().required().messages({
        'any.required': 'UserId is required.'
    })
})

export const MethodPermission = Joi.object({ 
    userId: Joi.string().required().messages({
        'any.required': 'UserId is required.'
    })
})