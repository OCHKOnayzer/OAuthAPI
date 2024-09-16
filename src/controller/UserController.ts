import { Request, Response, NextFunction } from "express";
import UserService from "../service/UserService";

class UserController {
    static async createUserOAuth(req: Request, res: Response, next: NextFunction) {
        try {

            const { code } = req.body

            const provider = req.params.provider;
            let userData;

            console.log(provider)

            switch (provider) {
                case 'yandex':
                    userData = await UserService.CreateUserYandex(code, 'yandex');
                    break;
                case 'vkid':
                    userData = await UserService.CreateUserVkId(code, 'vkid');
                    break;
                case 'ok':
                    userData = await UserService.CreateUserOk(code, 'ok');
                    break;
                case 'mailru':
                    userData = await UserService.CreateUserYandex(code, 'mailru');
                    break;
                default:
                    throw new Error('Unknown provider');
            }

            return res.json(userData);
        } catch (e: any) {
            next(e);
        }
    }
}

export default UserController;