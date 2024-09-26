import axios from 'axios';
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

    describe('CreateUserVkIdId', () => {
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
            const deviceId = 'testDeviceId';
            const stateString = 'testState';
            const codeVerifier = 'testCodeVerifier';

            const tokenResponseData = {
                access_token: 'vkAccessToken',
                refresh_token: 'vkRefreshToken',
                user_id: 'vkUserId123',
                email: '',  // Пустой email, так как может не быть доступен
            };
            (axios.post as jest.Mock).mockResolvedValueOnce({ data: tokenResponseData });

            const userResponseData = {
                user_id: 'vkUserId123',
                first_name: 'Test',
                last_name: 'User',
                phone: '79124422128',
            };
            (axios.post as jest.Mock).mockResolvedValueOnce({ data: userResponseData });

            const mockUser = {
                _id: 'vkUserId123',
                user_id: 'vkUserId123',
                email: tokenResponseData.email || '',  // Если email пустой
                first_name: userResponseData.first_name,
                last_name: userResponseData.last_name,
                number: userResponseData.phone,
                service: 'vkId',
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

            const result = await UserService.CreateUserVkIdId(code, deviceId, stateString, codeVerifier);

            expect(axios.post).toHaveBeenNthCalledWith(
                1,
                'https://id.vk.com/oauth2/auth',
                new URLSearchParams({
                    grant_type: 'authorization_code',
                    code_verifier: codeVerifier,
                    redirect_uri: 'https://main--transcendent-frangipane-30b77b.netlify.app/vkIdTest',
                    code,
                    client_id: '52336772',
                    device_id: deviceId,
                    state: stateString,
                }),
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            );

            expect(axios.post).toHaveBeenNthCalledWith(
                2,
                'https://id.vk.com/oauth2/user_info',
                new URLSearchParams({
                    client_id: '52336772',
                    access_token: tokenResponseData.access_token,
                }),
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            );

            expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
                { user_id: userResponseData.user_id },
                {
                    user_id: userResponseData.user_id,
                    first_name: userResponseData.first_name,
                    last_name: userResponseData.last_name,
                    email: tokenResponseData.email || '',  // Обработка пустого email
                    number: userResponseData.phone,
                    service: 'vkId',
                },
                { new: true, upsert: true }
            );

            expect(generationTokens).toHaveBeenCalledWith({
                _id: mockUser._id,
                user_id: mockUser.user_id,
                email: mockUser.email,
                first_name: mockUser.first_name,
                last_name: mockUser.last_name,
                number: mockUser.number,
                service: 'vkId',
            });

            expect(saveToken).toHaveBeenCalledWith(mockUser._id, 'testRefreshToken');

            expect(result).toEqual({
                user: mockUser,
                accessToken: 'testAccessToken',
                refreshToken: 'testRefreshToken',
                provider: 'vkId',
            });
        });

        it('should handle errors during VK OAuth process', async () => {
            const code = 'testCode';
            const deviceId = 'testDeviceId';
            const stateString = 'testState';
            const codeVerifier = 'testCodeVerifier';

            (axios.post as jest.Mock).mockRejectedValueOnce(new Error('VK OAuth error'));

            await expect(UserService.CreateUserVkIdId(code, deviceId, stateString, codeVerifier)).rejects.toThrow('VK OAuth error');

            expect(axios.post).toHaveBeenCalled();
            expect(consoleErrorMock).toHaveBeenCalledWith('Ошибка в createUserWithVkId:', 'VK OAuth error', expect.any(Error));
        });
    });
});
