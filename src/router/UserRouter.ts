import { Router } from "express";
import ValidationAuthFunction from "../validation/ValidationAuthFunction";
import UserController from "../controller/UserController"; 

const UserRouter = Router();
const controller = UserController;

UserRouter.post('/oauth/:provider', controller.createUserOAuth);

export default UserRouter;
