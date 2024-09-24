import axios from "axios";
import userModel from "../model/userModel";
import qs from 'qs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import TokenModel from "../model/TokenModel";
import { FindToken, generationTokens, saveToken, validateResreshToken } from "../tokens/tokenService";
import userDTO from "../dto/userDTO";
import ApiError from "../ApiError/ApiErrors";

interface OAuthResponse {
    user: userDTO;
    accessToken: string;
    refreshToken: string;
    provider: string;
}

class refreshService {

    static async refresh(refreshToken:string) {

        console.log('hello world')

        console.log("token check:",refreshToken)

        try {

            if(!refreshToken){
                throw ApiError.UnauthorizedError();
            }

            const userData =  validateResreshToken(refreshToken)
            
            const tokenFromDB = await FindToken(refreshToken)

            if(!userData || !tokenFromDB){ 
                throw ApiError.UnauthorizedError();
            }

            const user = await userModel.findById((userData as jwt.JwtPayload)._id);

            if (!user) {
                throw ApiError.UnauthorizedError();
            }

            const userDto = new userDTO(user);
            const tokens = generationTokens({...userDto});
            
            await saveToken(userDto._id, tokens.refreshToken);

            return{ 
                ...tokens,
                User:userDto
            }         

        } catch (e: any) {
           throw e;
        }
    }
    
}

export default refreshService;
