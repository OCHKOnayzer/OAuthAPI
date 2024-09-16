import ApiError from "../ApiError/ApiErrors";
import userModel from "../model/userModel";
import qs from 'qs';
import axios from 'axios';
import TokenModel from "../model/TokenModel";

class UserService { 

    static async CreateUserYandex(code: string, provider: string) { 
       
        try {
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

            const { access_token, refresh_token } = tokenResponse.data;

            const userResponse = await axios.get('https://login.yandex.ru/info', {
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            });    


            const userDataFromOAuth = {
                user_id: userResponse.data.id,
                username: userResponse.data.display_name || 'Unknown',
                email: userResponse.data.default_email || 'Unknown',
                first_name: userResponse.data.first_name || '',
                last_name: userResponse.data.last_name || '',
                number: userResponse.data.default_phone?.number || '',
                avatar: userResponse.data.is_avatar_empty ? null : userResponse.data.default_avatar_id,
                service:provider
            };

            console.log('users', userDataFromOAuth);
            console.log('refresh_token',refresh_token)
            const newUser = new userModel(userDataFromOAuth);
            await newUser.save();

            const saveToken = new TokenModel({
                user: newUser._id,
                refreshToken: refresh_token
            });
            await saveToken.save();

        } catch (e: any) { 

            throw e;
        }
    }

    
    
    static async CreateUserVkId(code: string, provider: string) {
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
            const { access_token, user_id } = tokenResponse.data;
            const userResponse = await axios.get('https://api.vk.com/method/users.get', {
                params: {
                    user_ids: user_id,
                    access_token: access_token,
                    v: '5.131'
                }
            });
    
            const userDataFromOAuth = {
                user_id: userResponse.data.response[0].id,
                username: `${userResponse.data.response[0].first_name} ${userResponse.data.response[0].last_name}`,
                email: '',
                first_name: userResponse.data.response[0].first_name || '',
                last_name: userResponse.data.response[0].last_name || '',
                number: '',
                avatar: userResponse.data.response[0].photo_200 || null,
                service: provider
            };
    
            console.log('User data from VK:', userDataFromOAuth);
    
        } catch (e: any) {
            console.error('Error in CreateUserVkId:', e.response?.data || e.message);
            throw e;
        }
    }
    

    static async CreateUserOk(code: string, provider: string) { 
        try {
            
            console.log(code);

            const response = await axios.post('https://api.ok.ru/oauth/token.do', null, {
                params: {
                  grant_type: 'authorization_code',
                  code,
                  redirect_uri: 'http://localhost:3000/oauth/callback',
                  client_id: '512002515808',
                  client_secret: 'B67994B7C202C407DB827C7C'
                }
              });

              const { access_token } = response.data;

              console.log('Access Token:', access_token);

        } catch (e: any) { 
            throw e;
        }
    }

}

export default UserService;
