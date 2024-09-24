import axios from 'axios';
import qs from 'qs';
import UserService from '../service/UserService';
import userModel from '../model/userModel';
import { generationTokens, saveToken } from '../tokens/tokenService';
import userDTO from '../dto/userDTO';

jest.mock('axios');
jest.mock('../model/userModel');
jest.mock('../tokens/tokenService');
jest.mock('../dto/userDTO');

describe('UserService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('CreateUserVkId', () => {

        const consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => {});
        const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
    
        afterEach(() => {
            jest.clearAllMocks();
        });
    
        afterAll(() => {
            consoleLogMock.mockRestore();
            consoleErrorMock.mockRestore();
        });

        it('should create a new user via VK OAuth', async () => {
            const code = 'testCode';
            const provider = 'vk';

            // Мок ответа от VK для получения токена
            const tokenResponseData = {
                access_token: 'vkAccessToken',
                user_id: 'vkUserId123',
                email: 'test@example.com',
            };
            (axios.post as jest.Mock).mockResolvedValueOnce({ data: tokenResponseData });

            // Мок ответа от VK для получения данных о пользователе
            const userResponseData = {
                response: [{
                    id: 'vkUserId123',
                    first_name: 'Test',
                    last_name: 'User',
                    number: '',
                }],
            };
            (axios.get as jest.Mock).mockResolvedValueOnce({ data: userResponseData });

            const mockUser = {
                _id: 'vkUserId123',
                user_id: 'vkUserId123',
                email: tokenResponseData.email,
                first_name: userResponseData.response[0].first_name,
                last_name: userResponseData.response[0].last_name,
                number: userResponseData.response[0].number,
                service: provider,
            };
            (userModel.findOneAndUpdate as jest.Mock).mockResolvedValueOnce(mockUser);

            (userDTO as jest.Mock).mockImplementation((user) => ({
                _id: user._id,
                user_id: user.user_id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                number: user.number,
                service: user.service,
            }));

            (generationTokens as jest.Mock).mockReturnValue({
                accessToken: 'testAccessToken',
                refreshToken: 'testRefreshToken',
            });
            (saveToken as jest.Mock).mockResolvedValueOnce(true);

            // Вызов тестируемого метода
            const result = await UserService.CreateUserVkId(code, provider);

            // Проверка вызова запросов на получение токена
            expect(axios.post).toHaveBeenCalledWith(
                'https://oauth.vk.com/access_token',
                qs.stringify({
                    client_id: process.env.client_id_VK,
                    client_secret: process.env.client_secret_VK,
                    redirect_uri: process.env.redirect_uri_VK,
                    code,
                }),
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            );

            // Проверка вызова запроса на получение данных пользователя
            expect(axios.get).toHaveBeenCalledWith('https://api.vk.com/method/users.get', {
                params: {
                    user_ids: tokenResponseData.user_id,
                    access_token: tokenResponseData.access_token,
                    v: '5.131',
                },
            });

            // Проверка вызова обновления или создания пользователя
            expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
                { user_id: userResponseData.response[0].id },
                {
                    user_id: userResponseData.response[0].id,
                    email: tokenResponseData.email,
                    first_name: userResponseData.response[0].first_name,
                    last_name: userResponseData.response[0].last_name,
                    number: userResponseData.response[0].number || '',
                    service: provider,
                },
                { new: true, upsert: true }
            );

            // Проверка генерации токенов
            expect(generationTokens).toHaveBeenCalledWith({
                _id: mockUser._id,
                user_id: mockUser.user_id,
                email: mockUser.email,
                first_name: mockUser.first_name,
                last_name: mockUser.last_name,
                number: mockUser.number,
                service: provider,
            });

            // Проверка сохранения refresh-токена
            expect(saveToken).toHaveBeenCalledWith(mockUser._id, 'testRefreshToken');

            // Проверка результата функции
            expect(result).toEqual({
                user: mockUser,
                accessToken: 'testAccessToken',
                refreshToken: 'testRefreshToken',
                provider: provider,
            });
        });

        it('should handle errors during VK OAuth process', async () => {
            const code = 'testCode';
            const provider = 'vk';

            // Мок для ошибки при запросе токена
            (axios.post as jest.Mock).mockRejectedValueOnce(new Error('VK OAuth error'));

            await expect(UserService.CreateUserVkId(code, provider)).rejects.toThrow('VK OAuth error');

            // Проверка, что ошибка была выброшена
            expect(axios.post).toHaveBeenCalled();
        });
    });
});
