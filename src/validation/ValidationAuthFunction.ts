import { Request, Response, NextFunction } from "express";
import { createUserSchema,AuthUserScheme,updateUserScheme } from "./userDataValidation";

class ValidationAuthFunction{ 
    static validateCreateUser(req: Request, res: Response, next: NextFunction){
        const { error } = createUserSchema.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({ errors: error.details.map(err => err.message) });
        }
        next();
    };
    static validateLoginUser(req: Request, res: Response, next: NextFunction){
        const { error } = AuthUserScheme.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({ errors: error.details.map(err => err.message) });
        }
        next();
    };
    static validateUpdateUser(req: Request, res: Response, next: NextFunction){
        const { error } = updateUserScheme.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({ errors: error.details.map(err => err.message) });
        }
        next();
    };
}

export default ValidationAuthFunction