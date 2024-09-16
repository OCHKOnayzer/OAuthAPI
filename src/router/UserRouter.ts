import { Router } from "express";
import ValidationAuthFunction from "../validation/ValidationAuthFunction";
import UserController from "../controller/UserController"; 

const UserRouter = Router();
const controller = UserController;

// Роут с динамическим параметром провайдера (yandex, vkid, ok, mailru)
UserRouter.post('/oauth/:provider', controller.createUserOAuth);

export default UserRouter;
