import { RefreshTokenCommand } from '../commands/refresh-token.command';
import { RefreshTokenHandler } from './refresh-token.handler';
import { JwtService } from '../services/jwt.service';
import { getUserByRefreshToken, storeRefreshToken } from '../repository/auth.repository';
import { UnauthorizedError } from '../errors/unauthorized.error';
import type { TUserWithoutPassword } from '../../user/models/user.models';
import type { IAuthTokens } from '../models/auth.model';

jest.mock('../repository/auth.repository', () => ({
  getUserByRefreshToken: jest.fn(),
  storeRefreshToken: jest.fn(),
}));

jest.mock('../services/jwt.service', () => ({
  JwtService: {
    generateTokens: jest.fn(),
    verifyAccessToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
    refreshAccessToken: jest.fn(),
  },
}));

const mockGetUserByRefreshToken = getUserByRefreshToken as jest.MockedFunction<typeof getUserByRefreshToken>;
const mockGenerateTokens = JwtService.generateTokens as jest.MockedFunction<typeof JwtService.generateTokens>;
const mockVerfiyRefreshToken = JwtService.verifyRefreshToken as jest.MockedFunction<
  typeof JwtService.verifyRefreshToken
>;

const mockedUser: TUserWithoutPassword & { refreshToken: string | null } = {
  id: 1,
  public_id: '',
  name: 'User 1',
  surname: 'Surname 1',
  email: 'email@example.com',
  refreshToken:
    'refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwdWJsaWNJZCI6ImFkYWY5MTYwLTYyMGUtNGUxMy1hZTEyLTVkNmM0NmJmZjMzMiIsIm5hbWUiOiJLcnlzdGlhbiIsInN1cm5hbWUiOiIyMjQyMSIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJpYXQiOjE3NDE2Mzc0NDgsImV4cCI6MTc0MjE2MzA0OH0.h56FH92L6lvzZSWLn_GPXaWoWzbCgZAvwVRYRU3Zl-g; Path=/; HttpOnly; Expires=Mon, 17 Mar 2025 20:10:48 GMT;',
  createdAt: new Date('2025-01-27T17:46:46.174Z'),
  updatedAt: new Date('2025-01-27T17:46:46.174Z'),
};

const mockedTokens: IAuthTokens = {
  accessToken:
    'accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwdWJsaWNJZCI6ImFkYWY5MTYwLTYyMGUtNGUxMy1hZTEyLTVkNmM0NmJmZjMzMiIsIm5hbWUiOiJLcnlzdGlhbiIsInN1cm5hbWUiOiIyMjQyMSIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJpYXQiOjE3NDE2MzgxOTksImV4cCI6MTc0MTcyNDU5OX0.Kyb7t6hjCugcJ-mMXRpjlXBlDEkW1PNWcC-8nV2kpKA; Path=/; HttpOnly; Expires=Mon, 10 Mar 2025 20:38:19 GMT;n',
  refreshToken:
    'refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwdWJsaWNJZCI6ImFkYWY5MTYwLTYyMGUtNGUxMy1hZTEyLTVkNmM0NmJmZjMzMiIsIm5hbWUiOiJLcnlzdGlhbiIsInN1cm5hbWUiOiIyMjQyMSIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJpYXQiOjE3NDE2Mzc0NDgsImV4cCI6MTc0MjE2MzA0OH0.h56FH92L6lvzZSWLn_GPXaWoWzbCgZAvwVRYRU3Zl-g; Path=/; HttpOnly; Expires=Mon, 17 Mar 2025 20:10:48 GMT;',
  publicId: 'mocked-id',
  name: 'mocked-refresh-token',
  surname: 'mocked-surname',
  email: 'mocked-email',
};

const mockRefreshToken = mockedTokens.refreshToken;

describe('RefreshTokenHandler', () => {
  let handler: RefreshTokenHandler;

  beforeEach(() => {
    handler = new RefreshTokenHandler();

    jest.clearAllMocks();
  });

  test('should have correct command type', () => {
    expect(handler.commandType).toBe('REFRESH_TOKEN');
  });

  test('should successfully refresh token when valid refresh token is provided', async () => {
    const command = new RefreshTokenCommand({ refreshToken: mockRefreshToken });

    mockVerfiyRefreshToken.mockReturnValue(mockedTokens);
    mockGetUserByRefreshToken.mockResolvedValue(mockedUser);
    mockGenerateTokens.mockReturnValue(mockedTokens);

    const result = await handler.execute(command);

    expect(JwtService.verifyRefreshToken).toHaveBeenCalledWith(mockRefreshToken);
    expect(getUserByRefreshToken).toHaveBeenCalledWith(mockRefreshToken);
    expect(JwtService.generateTokens).toHaveBeenCalledWith({
      publicId: mockedUser.public_id,
      name: mockedUser.name,
      surname: mockedUser.surname,
      email: mockedUser.email,
    });
    expect(storeRefreshToken).toHaveBeenCalledWith(mockedUser.id, mockedTokens.refreshToken);
    expect(result).toEqual(mockedTokens);
  });

  test('should throw UnauthorizedError when refresh token verification fails', async () => {
    const command = new RefreshTokenCommand({ refreshToken: mockRefreshToken });
    (JwtService.verifyRefreshToken as jest.Mock).mockImplementation(() => {
      throw new Error('Token verification failed');
    });

    await expect(handler.execute(command)).rejects.toThrow(UnauthorizedError);
    expect(JwtService.verifyRefreshToken).toHaveBeenCalledWith(mockRefreshToken);
    expect(getUserByRefreshToken).not.toHaveBeenCalled();
    expect(JwtService.generateTokens).not.toHaveBeenCalled();
    expect(storeRefreshToken).not.toHaveBeenCalled();
  });
});
