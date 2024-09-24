import axios from 'axios';
import qs from 'qs';
import UserService from '../service/UserService';
import userModel from '../model/userModel';
import TokenModel from '../model/TokenModel';
import { generationTokens, saveToken, removeToken } from '../tokens/tokenService';
import crypto from 'crypto';

jest.mock('axios');
jest.mock('../model/userModel');
jest.mock('../tokens/tokenService');

describe('UserService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('CreateUserYandex', () => {
        it('should create a new user via Yandex OAuth', async () => {
            const code = 'testCode';
            const provider = 'yandex';

            const tokenResponseData = { access_token: 'yandexAccessToken' };
            const userResponseData = {
                id: 'userId123',
                default_email: 'test@example.com',
                first_name: 'Test',
                last_name: 'User',
                number: '891256565656',
            };

            (axios.post as jest.Mock).mockResolvedValueOnce({ data: tokenResponseData });
            (axios.get as jest.Mock).mockResolvedValueOnce({ data: userResponseData });

            const mockUser = { _id: 'userId123', ...userResponseData };
            (userModel.findOneAndUpdate as jest.Mock).mockResolvedValueOnce(mockUser);
            (generationTokens as jest.Mock).mockReturnValue({ accessToken: 'testAccessToken', refreshToken: 'testRefreshToken' });
            (saveToken as jest.Mock).mockResolvedValueOnce(true);

            const result = await UserService.CreateUserYandex(code, provider);

            expect(axios.post).toHaveBeenCalledWith(
                'https://oauth.yandex.ru/token',
                qs.stringify({
                    grant_type: 'authorization_code',
                    code,
                    client_id: process.env.client_id_YA,
                    client_secret: process.env.client_secret_YA,
                    redirect_uri: process.env.redirect_uri_YA,
                }),
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            );

            expect(axios.get).toHaveBeenCalledWith('https://login.yandex.ru/info', {
                headers: { Authorization: `Bearer ${tokenResponseData.access_token}` },
            });

            expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
                { user_id: userResponseData.id },
                {
                    user_id: userResponseData.id,
                    email: userResponseData.default_email,
                    first_name: userResponseData.first_name,
                    last_name: userResponseData.last_name,
                    number: '',
                    service: provider,
                },
                { new: true, upsert: true }
            );

            expect(saveToken).toHaveBeenCalledWith(mockUser._id, 'testRefreshToken');

            expect(result).toEqual({
                user: mockUser,
                accessToken: 'testAccessToken',
                refreshToken: 'testRefreshToken',
                provider,
            });
        });
    });

    describe('CreateUserMailRu', () => {
        it('should create a new user via Mail.ru OAuth', async () => {
            const code = 'testCode';
            const provider = 'mailru';
    
            const tokenResponseData = { access_token: 'mailruAccessToken', expires_in: 3600 };
            const userResponseData = {
                id: 'userId123',
                email: 'test@mail.ru',
                first_name: 'Test',
                last_name: 'User',
            };
    
            (axios.post as jest.Mock).mockResolvedValueOnce({ data: tokenResponseData });
            (axios.get as jest.Mock).mockResolvedValueOnce({ data: userResponseData });
    
            const mockUser = { _id: 'userId123', ...userResponseData };
            (userModel.findOneAndUpdate as jest.Mock).mockResolvedValueOnce(mockUser);
            (generationTokens as jest.Mock).mockReturnValue({ accessToken: 'testAccessToken', refreshToken: 'testRefreshToken' });
            (saveToken as jest.Mock).mockResolvedValueOnce(true);
    
            const result = await UserService.CreateUserMailRu(code, provider);
    
            expect(axios.post).toHaveBeenCalledWith(
                'https://oauth.mail.ru/token',
                qs.stringify({
                    grant_type: 'authorization_code',
                    code,
                    redirect_uri: 'http://localhost:3000',
                    scope: 'userinfo,contacts',
                }),
                { 
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Basic ${Buffer.from('91bdcb05404e4dad9fdee6d080c7426c:fc2e60c36748476eb73665bcc822e56a').toString('base64')}`
                    }
                }
            );
    
            expect(axios.get).toHaveBeenCalledWith(
                'https://oauth.mail.ru/userinfo?access_token=mailruAccessToken'
            );
    
            expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
                { user_id: userResponseData.id },
                {
                    $set: {
                        user_id: userResponseData.id,
                        email: userResponseData.email,
                        first_name: userResponseData.first_name,
                        last_name: userResponseData.last_name,
                        number: '',
                        service: provider,
                    }
                },
                { new: true, upsert: true }
            );
    
            expect(saveToken).toHaveBeenCalledWith(mockUser._id, 'testRefreshToken');
    
            expect(result).toEqual({
                user: mockUser,
                accessToken: 'testAccessToken',
                refreshToken: 'testRefreshToken',
                provider,
            });
        });
    });
    
    describe('CreateUserOk', () => {
        it('should create a new user via OK OAuth', async () => {
            const code = 'testCode';
            const provider = 'ok';
    
            const tokenResponseData = { access_token: 'okAccessToken' };
            const userResponseData = {
                uid: 'userId123',
                email: 'test@mail.ru',
                first_name: 'Test',
                last_name: 'User',
            };
    
            (axios.post as jest.Mock).mockResolvedValueOnce({ data: tokenResponseData });
    
            // Исправленная генерация сигнатуры
            const sig = crypto
            .createHash('md5')
            .update(`application_key=CBGEGLLGDIHBABABA&method=users.getCurrentUser&access_token=${tokenResponseData.access_token}&client_secret=B67994B7C202C407DB827C7C`, 'utf8')
            .digest('hex');
    
            const userInfoUrl = `https://api.ok.ru/fb.do?access_token=${tokenResponseData.access_token}&application_key=CBGEGLLGDIHBABABA&method=users.getCurrentUser&sig=${sig}`;
            (axios.get as jest.Mock).mockResolvedValueOnce({ data: userResponseData });
    
            const mockUser = { _id: 'userId123', ...userResponseData };
            (userModel.findOneAndUpdate as jest.Mock).mockResolvedValueOnce(mockUser);
            (generationTokens as jest.Mock).mockReturnValue({ accessToken: 'testAccessToken', refreshToken: 'testRefreshToken' });
            (saveToken as jest.Mock).mockResolvedValueOnce(true);
    
            const result = await UserService.CreateUserOk(code, provider);
    
            expect(axios.post).toHaveBeenCalledWith(
                'https://api.ok.ru/oauth/token.do',
                qs.stringify({
                    grant_type: 'authorization_code',
                    code,
                    redirect_uri: 'http://localhost:3000',
                    client_id: '512002515808',
                    client_secret: 'B67994B7C202C407DB827C7C',
                }),
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            );
    
            expect(axios.get).toHaveBeenCalledWith(userInfoUrl);
    
            expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
                { user_id: userResponseData.uid },
                {
                    user_id: userResponseData.uid,
                    email: userResponseData.email,
                    first_name: userResponseData.first_name,
                    last_name: userResponseData.last_name,
                    number: '',
                    service: provider,
                },
                { new: true, upsert: true }
            );
    
            expect(saveToken).toHaveBeenCalledWith(mockUser._id, 'testRefreshToken');
    
            expect(result).toEqual({
                user: mockUser,
                accessToken: 'testAccessToken',
                refreshToken: 'testRefreshToken',
                provider,
            });
        });
    });

    describe('logout', () => {
        it('should remove the refresh token', async () => {
            const refreshToken = 'testRefreshToken';

            (removeToken as jest.Mock).mockResolvedValueOnce(true);

            const result = await UserService.logout(refreshToken);

            expect(removeToken).toHaveBeenCalledWith(refreshToken);
            expect(result).toBe(true);
        });
    });
});
