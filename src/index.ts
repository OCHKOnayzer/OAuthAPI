import express from "express";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import { Router } from "express";
import UserRouter from "./router/UserRouter";
import errorMiddleware from "./middleware/errorMiddleware";
import cookie from 'cookie-parser';
import morgan from 'morgan';
import cors, { CorsOptions } from 'cors';
dotenv.config()

const altPORT: number = 1337;
const PORT = process.env.PORT || altPORT;

const app = express();

app.use(express.json());
app.use(cookie());
const allowedOrigins: string[] = [
    'http://localhost:3000',
    'https://427e-88-80-62-218.ngrok-free.app' // Ваш ngrok URL
  ];
  
  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin!) || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  };
  
  app.use(cors(corsOptions));

const apiRouter = Router();
app.use('/api', apiRouter);
apiRouter.use('/userRouter', UserRouter);

app.use(errorMiddleware);

const start = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/oAuthApi');
        app.listen(PORT, () => console.log(`Server listening on PORT ${PORT}`));
    } catch (e) {
        console.log(`Server error: ${e}`);
    }
};

start();
