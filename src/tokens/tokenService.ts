import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import TokenModel from "../model/TokenModel";

type PayloadDto = { 
    user_id:string,
    first_name:string,
    last_name:string,
    email:string,
    number:string,
    service:string
}

export const generationTokens = (payload:PayloadDto)=>{ 
    const secretAccessKey = process.env.ACCESSTOKEN
    const secretRefreshKey = process.env.REFRESHTOKEN
    if(!secretAccessKey){ 
        throw new Error("Секретный ключ для токена не нейден в переменных окружениях")
    }
    if(!secretRefreshKey){ 
        throw new Error("Секретный ключ для токена не нейден в переменных окружениях")
    }
    const accessToken = jwt.sign(payload, secretAccessKey, {expiresIn: '30m'});
    const refreshToken = jwt.sign(payload, secretRefreshKey, {expiresIn:'30d'})
    return { 
        accessToken,
        refreshToken
    }
}

export const saveToken = async(userId:Types.ObjectId, refreshToken:string) =>{ 
    
    const tokenData = await TokenModel.findOne({user:userId});

    if(tokenData){ 
        tokenData.refreshToken = refreshToken;
        return tokenData.save();
    };

    const token = await TokenModel.create({user:userId,refreshToken})

    return token
}
export const removeToken = async(refreshToken:string)=> { 
    const tokenData = await TokenModel.deleteOne({refreshToken})
    return tokenData
}
export const findToken = async(refreshToken:string)=>{ 
    const tokenData = await TokenModel.findOne({refreshToken})
    return tokenData
}

export const validateResreshToken = (token:string)=>{
    try{
        const secretRefreshKey:any = process.env.REFRESHTOKEN
        const userData = jwt.verify(token,secretRefreshKey);
        return userData;
     }catch(e){
        console.log(e)
        return null;
     }
}

export const FindToken = async(refreshToken:string)=>{ 
    const tokenData = await TokenModel.findOne({refreshToken})
    return tokenData
}