import { Request, Response, NextFunction } from "express";
import UserService from "../service/UserService";
import refreshService from "../service/refreshService";
import axios from "axios";


class UserController {
    static async createUserOAuth(req: Request, res: Response, next: NextFunction) {
        try {
            const { code, user } = req.body;
            console.log('Request body:', { code });

            const provider = req.params.provider;
            let userData: any;

            console.log("provider:",provider)

            switch (provider) {
                case 'yandex':
                    userData = await UserService.CreateUserYandex(code, 'yandex');
                    break;
                case 'vk':
                    userData = await UserService.CreateUserVkId(code, 'vk');
                    break;
                case 'ok':
                    userData = await UserService.CreateUserOk(code, 'ok');
                    break;
                case 'vkid':
                    userData = await UserService.CreateUserVkIdId(code);
                    break;
                case 'mailru':
                    userData = await UserService.CreateUserMailRu(code, user);
                    break;
                default:
                    throw new Error('Неподдерживаемый провайдер');
            }

            res.cookie('refreshToken', userData.refreshToken, {
                httpOnly: true, 
                secure: true,
                sameSite: 'none',
                path: '/', 
                maxAge: 30 * 24 * 60 * 60 * 1000
            });

            // для localhost
            
            // res.cookie('refreshToken', userData.refreshToken, {
            //     httpOnly: true,  });

            console.log(userData)

            return res.json(userData);

        } catch (e: any) {
            next(e);
        }
    }

    static async checkAuth(req: Request, res: Response, next: NextFunction) {
        try {
            const provider = req.query.provider;
            const authorizationHeader = req.headers['authorization'];
            const { refreshToken } = req.cookies;
            const access_token = authorizationHeader && authorizationHeader.split(' ')[1];
    
            console.log("token check:",refreshToken)

            if (!access_token) {
                return res.status(401).json({ message: 'Access token is missing' });
            }
    
            let userData = await refreshService.refresh(refreshToken);
    
            if (!userData) {
                return res.status(401).json({ message: 'User data not found' });
            }
    
            if ('User' in userData) {
                
                res.cookie('refreshToken', userData.refreshToken, {

                httpOnly: true,
                secure: true,
                sameSite: 'none',
                path: '/',
                maxAge: 30 * 24 * 60 * 60 * 1000

                });
                
                return res.status(200).json({ user: userData.User, tokens: { accessToken: userData.accessToken, refreshToken: userData.refreshToken } });
            }
    
            return res.status(200).json({ user: userData });
        } catch (error: any) {
            console.error(error);
            return res.status(500).json({ message: 'An error occurred during authentication' });
        }
    }
    
    static async logout(req:Request,res:Response,next:NextFunction){ 
        try{ 

            const {refreshToken} = req.cookies;

            const token = await UserService.logout(refreshToken);

            res.clearCookie('refreshToken')

            return res.json(token);

        }catch(e){ 

            next(e)

        }
    }

}

export default UserController;