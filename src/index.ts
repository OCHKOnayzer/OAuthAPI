import express from "express";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import { Router } from "express";
import UserRouter from "./router/UserRouter";
import TaskRouter from "./router/TaskRouter";
import errorMiddleware from "./middleware/errorMiddleware";
import cookie from 'cookie-parser';
import morgan from 'morgan';

dotenv.config()

const altPORT: number = 1909;
const PORT = process.env.PORT || altPORT;

const app = express();

app.use(morgan('combined'));
app.use(express.json());
app.use(cookie());

const apiRouter = Router();
app.use('/api', apiRouter);
apiRouter.use('/userRouter', UserRouter);
apiRouter.use('/taskRouter', TaskRouter);

app.use(errorMiddleware);

const start = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/TRELLOBOX');
        app.listen(PORT, () => console.log(`Server listening on PORT ${PORT}`));
    } catch (e) {
        console.log(`Server error: ${e}`);
    }
};

start();
