import ApiError from "../ApiError/ApiErrors";
import userModel from "../model/userModel";
import qs from 'qs';
import axios from 'axios';
import TokenModel from "../model/TokenModel";
import crypto from 'crypto';
import { generationTokens, removeToken, saveToken } from "../tokens/tokenService";
import userDTO from "../dto/userDTO";
import { Types } from "mongoose";
import * as VKID from '@vkid/sdk';

interface OAuthResponse {
    user: userDTO;
    accessToken: string;
    refreshToken: string;
    provider: string;
}

class UserService { 

    static async CreateUserYandex(code: string, provider: string): Promise<OAuthResponse> { 
        try {
            console.log(`Code received: ${code}`);
            
            const tokenResponse = await axios.post('https://oauth.yandex.ru/token', 
                qs.stringify({
                    grant_type: 'authorization_code',
                    code: code,
                    client_id: process.env.client_id_YA,
                    client_secret: process.env.client_secret_YA,
                    redirect_uri: process.env.redirect_uri_YA
                }), 
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );
    
            const { access_token } = tokenResponse.data;
    
            const userResponse = await axios.get('https://login.yandex.ru/info', {
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            });
    
            const userDataFromOAuth = {
                user_id: userResponse.data.id,
                email: userResponse.data.default_email || 'hidden',
                first_name: userResponse.data.first_name || '',
                last_name: userResponse.data.last_name || '',
                number: userResponse.data.default_phone?.number || '',
                service: provider
            };

            let newUser = await userModel.findOneAndUpdate(
                { user_id: userDataFromOAuth.user_id },
                userDataFromOAuth,
                { new: true, upsert: true }
            ); 
    
            const dto = new userDTO(newUser);
            const tokens = generationTokens({ ...dto });
    
            console.log({...tokens});

            await saveToken(dto._id, tokens.refreshToken);
    
            return { 
                user: newUser, 
                accessToken: tokens.accessToken, 
                refreshToken: tokens.refreshToken, 
                provider: provider 
            };
    
        } catch (e: any) {
            console.error('Error in CreateUserVkId:', e.response?.data || e.message);
            throw new Error(`Yandex OAuth failed:`);
        }
    }
    
    
    static async CreateUserVkId(code: string, provider: string): Promise<OAuthResponse> {

        console.log(provider);
    
        try {
            console.log('Authorization code:', code);
    
            const tokenUrl = 'https://oauth.vk.com/access_token';
    
            const params = {
                client_id: process.env.client_id_VK,
                client_secret: process.env.client_secret_VK,
                redirect_uri: process.env.redirect_uri_VK,
                code: code
            };
    
            const tokenResponse = await axios.post(
                tokenUrl,
                qs.stringify(params),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );
    
            const { access_token, user_id, email } = tokenResponse.data;
    
            const userResponse = await axios.get('https://api.vk.com/method/users.get', {
                params: {
                    user_ids: user_id,
                    access_token: access_token,
                    v: '5.131'
                }
            });
    
            console.log(userResponse.data)

            const userDataFromOAuth = {
                user_id: userResponse.data.response[0].id,
                email:email || '',  
                first_name: userResponse.data.response[0].first_name,
                last_name: userResponse.data.response[0].last_name,
                number: userResponse.data.response[0].number || '', 
                service: 'vk'
            };

            let newUser = await userModel.findOneAndUpdate(
                { user_id: userDataFromOAuth.user_id },
                userDataFromOAuth,
                { new: true, upsert: true }
            ); 
            
            const dto = new userDTO(newUser);
            const tokens = generationTokens({ ...dto });
    
            console.log({...tokens});

            await saveToken(dto._id, tokens.refreshToken);
    
            return { 
                user: newUser, 
                accessToken: tokens.accessToken, 
                refreshToken: tokens.refreshToken, 
                provider: provider 
            };
    
        } catch (e: any) {
            console.error('Error in CreateUserVkId:', e.response?.data || e.message);
            throw e;
        }
    }
    
    static async CreateUserVkIdId(code: string,deviceId:string,stateString:string){

        console.log('hello world')

        const codeVerifire = 'FGH767Gd65dsf76TgBh98vGbvDsF7GhEtr67GtRf';

        const clientId = 52336772

        try {
            // Запрос на обмен кода авторизации на токены
            const tokenResponse = await axios.post('https://id.vk.com/oauth2/auth', 
                new URLSearchParams({
                    grant_type: 'authorization_code',
                    code_verifier: codeVerifire, 
                    redirect_uri: 'https://main--transcendent-frangipane-30b77b.netlify.app/vkIdTest', 
                    code: code, 
                    client_id: '52336772',
                    device_id: deviceId,      
                    state: stateString
                }), 
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            console.log("tokenResponse.data:",tokenResponse.data)



            // console.log("tokenResponse:",tokenResponse)

            // // Извлечение токенов из ответа
            // const { access_token, refresh_token } = tokenResponse.data;
    
            // // Логирование для отладки
            // console.log('Access token:', access_token);
            // console.log('Refresh token:', refresh_token);
    
            // // Запрос на получение информации о пользователе
            // const userInfoResponse = await axios.get('https://id.vk.com/oauth2/user_info', {
            //     params: {
            //         access_token: access_token,
            //     }
            // });
    
            // // Извлечение данных о пользователе
            // const user = userInfoResponse.data;
    
            // console.log('User info from VK ID:', user);
    
            // // Формирование данных пользователя для базы данных
            // const userDataFromOAuth = {
            //     user_id: user.sub,  // Уникальный идентификатор пользователя
            //     first_name: user.given_name,  // Имя пользователя
            //     last_name: user.family_name,  // Фамилия пользователя
            //     email: user.email || '',  // Email пользователя (если доступен)
            //     number: user.phone_number || '',  // Телефонный номер (если доступен)
            //     service: 'vkId'
            // };й
    
            // console.log('User data from VK ID:', userDataFromOAuth);
    
            // // Обновление или создание пользователя в базе данных
            // let newUser = await userModel.findOneAndUpdate(
            //     { user_id: userDataFromOAuth.user_id },
            //     userDataFromOAuth,
            //     { new: true, upsert: true }
            // );
    
            // // Генерация пользовательских токенов
            // const dto = new userDTO(newUser);
            // const tokens = generationTokens({ ...dto });
    
            // // Сохранение refresh-токена
            // await saveToken(dto._id, tokens.refreshToken);
    
            // return {
            //     user: newUser,
            //     accessToken: tokens.accessToken,
            //     refreshToken: tokens.refreshToken,
            //     provider: 'vkId'
            // };
    
        } catch (error: any) {
            // Логирование ошибки
            console.error('Ошибка в createUserWithVkId:', error.response ? error.response.data : error.message, error);
            throw error;
        }
    }
    
      static async CreateUserOk(code: string, provider: string): Promise<OAuthResponse> {
        try {
            console.log('Authorization code:', code);
    
            const tokenUrl = 'https://api.ok.ru/oauth/token.do';
            const params = {
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: 'http://localhost:3000',
                client_id: '512002515808', 
                client_secret: 'B67994B7C202C407DB827C7C'
            };
    
            const tokenResponse = await axios.post(
                tokenUrl,
                qs.stringify(params),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );
    
            const { access_token } = tokenResponse.data;
            console.log('Access Token:', access_token);
    
            const application_key = 'CBGEGLLGDIHBABABA'; 
            const method = 'users.getCurrentUser';
    
            const sig = crypto
                .createHash('md5')
                .update(`application_key=${application_key}&method=${method}&access_token=${access_token}&client_secret=${params.client_secret}`, 'utf8')
                .digest('hex');

                console.log('Generated Signature:', sig);
    
            const userInfoUrl = `https://api.ok.ru/fb.do?access_token=${access_token}&application_key=${application_key}&method=${method}&sig=${sig}`;

            console.log('User Info URL:', userInfoUrl);
    
            const userInfoResponse = await axios.get(userInfoUrl);
    
            const userDataFromOAuth = { 
                user_id: userInfoResponse.data.uid,
                email: userInfoResponse.data.email || '', 
                first_name: userInfoResponse.data.first_name || '',
                last_name: userInfoResponse.data.last_name || '',
                number: '',
                service: provider
            };

            const newUser = await userModel.findOneAndUpdate(
                { user_id: userDataFromOAuth.user_id },
                userDataFromOAuth,
                { new: true, upsert: true }
            );
            const dto = new userDTO(newUser);
            const tokens = generationTokens({ ...dto });
    
            console.log({...tokens});

            await saveToken(dto._id, tokens.refreshToken);
    
            return { 
                user: newUser, 
                accessToken: tokens.accessToken, 
                refreshToken: tokens.refreshToken, 
                provider: provider 
            };
    
        } catch (e: any) {
            console.error('Error in CreateUserOk:', e.response?.data || e.message);
            throw e;
        }
    }
    static async CreateUserMailRu(code: string, provider: string): Promise<OAuthResponse> {
        try {
            console.log('Authorization code:', code);
    
            const tokenUrl = 'https://oauth.mail.ru/token';
            const redirectUri = 'http://localhost:3000';
    
            const clientId = '91bdcb05404e4dad9fdee6d080c7426c';
            const clientSecret = 'fc2e60c36748476eb73665bcc822e56a';
            const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
            const params = {
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri,
                scope: 'userinfo,contacts',
            };
    
            const tokenResponse = await axios.post(tokenUrl, qs.stringify(params), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${basicAuth}`
                }
            });
    
            const { access_token, expires_in } = tokenResponse.data;
            console.log('Access Token:', access_token);
            console.log('Expires In:', expires_in);

            const userInfoUrl = `https://oauth.mail.ru/userinfo?access_token=${access_token}`;
            const userInfoResponse = await axios.get(userInfoUrl);
    
            const { id, email, first_name, last_name } = userInfoResponse.data;
    
            if (!id) {
                throw new Error('User ID is missing from Mail.ru response');
            }
    
            console.log("data json fromatik:",userInfoResponse.data)

            const userDataFromOAuth = {
                user_id: id,
                email: email,
                first_name: first_name,
                last_name: last_name ,
                number: '',
                service: 'mailru'
            };

            const newUser = await userModel.findOneAndUpdate(
                { user_id: userDataFromOAuth.user_id },
                { $set: userDataFromOAuth },
                { new: true, upsert: true }
            );
    
            const dto = new userDTO(newUser);
            const tokens = generationTokens({ ...dto });
    
            console.log({...tokens});
    
            await saveToken(dto._id, tokens.refreshToken);
    
            return { 
                user: newUser, 
                accessToken: tokens.accessToken, 
                refreshToken: tokens.refreshToken, 
                provider: 'mailru' 
            };
    
        } catch (e: any) {
            console.error('Error in CreateUserMailRu:', e.response?.data || e.message);
            throw e;
        }
    }    

    static async logout(refreshToken:string){ 

        try{ 

            const token = await removeToken(refreshToken)
            return token

        }catch(e){ 
            throw e;
        }

    }

}

export default UserService;
