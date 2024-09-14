import { Request, Response,NextFunction } from "express";
import UserService from "src/service/UserService";
import { UserRequest } from "src/interface/oauthInterface";

class UserController{ 

    static async createUserYndexOAuth(req:Request, res:Response, next:NextFunction){ 

        try{ 
            
            console.log(req.body);

            const requestItem: UserRequest = req.body;

            const userData = await UserService.CreateUserService( requestItem );

            return res.json(userData);

        }catch(e:any){ 
            next(e)
        }
    }

    static async createUserVKIDOAuth(req:Request,res:Response,next:NextFunction){ 

        try{

            console.log(req.body);

            

        }catch(e:any){ 
            next(e);
        }

    }

}

export default UserController