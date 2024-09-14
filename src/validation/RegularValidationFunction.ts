import { Request, Response, NextFunction } from "express";
import { MethodUserIdOnly,MethodPermission } from "./RegularValidation";
class RegularValidationFunction{ 
    static validateUserIdOnly(req:Request, res:Response, next:NextFunction){ 
        const { error } = MethodUserIdOnly.validate(req.body, {abortEarly:false});
        if (error) {
            return res.status(400).json({ errors: error.details.map(err => err.message) });
        }
        next();
    }
    
    static MethodPermission(req:Request, res:Response, next:NextFunction){ 
        const { error } = MethodPermission.validate(req.body, {abortEarly:false});
        if (error) {
            return res.status(400).json({ errors: error.details.map(err => err.message) });
        }
        next();
    }
}
export default RegularValidationFunction