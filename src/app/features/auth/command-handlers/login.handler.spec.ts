import { LoginHandler } from './login.handler';
import { LoginCommand } from '../commands/login.command';
import { validateUserCredentials, storeRefreshToken } from '../repository/auth.repository';
import type { TUserWithoutPassword } from '../../user/models/user.models';
import { JwtService } from '../services/jwt.service';
import type { IAuthTokens } from '../models/auth.model';

jest.mock('../repository/auth.repository', () => ({
  validateUserCredentials: jest.fn(),
  storeRefreshToken: jest.fn(),
}));

jest.mock('../services/jwt.service', () => ({
  JwtService: {
    generateTokens: jest.fn(),
    verifyAccessToken: jest.fn(),
    refreshAccessToken: jest.fn(),
  },
}));

const mockValidateUserCredentials = validateUserCredentials as jest.MockedFunction<typeof validateUserCredentials>;
const mockStoreRefreshToken = storeRefreshToken as jest.MockedFunction<typeof storeRefreshToken>;
const mockGenerateTokens = JwtService.generateTokens as jest.MockedFunction<typeof JwtService.generateTokens>;

const mockedUser: TUserWithoutPassword & { refreshToken: string | null } = {
  id: 1,
  public_id: '',
  name: 'User 1',
  surname: 'Surname 1',
  email: 'email@example.com',
  refreshToken: null,
  createdAt: new Date('2025-01-27T17:46:46.174Z'),
  updatedAt: new Date('2025-01-27T17:46:46.174Z'),
};

const mockedTokens: IAuthTokens = {
  accessToken: 'mocked-access-token',
  refreshToken: 'mocked-refresh-token',
  publicId: 'mocked-id',
  name: 'mocked-refresh-token',
  surname: 'mocked-surname',
  email: 'mocked-email',
};

describe('LoginHandler', () => {
  let handler: LoginHandler;

  beforeEach(() => {
    handler = new LoginHandler();
    jest.clearAllMocks();
  });

  it('should login a User successfully and return tokens', async () => {
    const command = new LoginCommand({
      email: 'email@example.com',
      password: 'password1234',
    });

    mockValidateUserCredentials.mockResolvedValue(mockedUser);
    mockGenerateTokens.mockReturnValue(mockedTokens);

    const result = await handler.execute(command);

    expect(mockValidateUserCredentials).toHaveBeenCalledWith('email@example.com', 'password1234');

    expect(mockGenerateTokens).toHaveBeenCalledWith({
      publicId: mockedUser.public_id,
      email: mockedUser.email,
      name: mockedUser.name,
      surname: mockedUser.surname,
    });

    expect(mockStoreRefreshToken).toHaveBeenCalledWith(mockedUser.id, mockedTokens.refreshToken);

    expect(result).toEqual(mockedTokens);
  });

  it('should throw an error when user credentials are invalid', async () => {
    const error = new Error('Invalid credentials');
    (validateUserCredentials as jest.Mock).mockRejectedValue(error);

    const command = new LoginCommand({
      email: 'email@example.com',
      password: 'wrong-password',
    });

    await expect(handler.execute(command)).rejects.toThrow('Invalid credentials');

    expect(validateUserCredentials).toHaveBeenCalledWith('email@example.com', 'wrong-password');

    expect(JwtService.generateTokens).not.toHaveBeenCalled();
    expect(storeRefreshToken).not.toHaveBeenCalled();
  });
});
