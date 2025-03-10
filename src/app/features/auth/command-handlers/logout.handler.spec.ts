import { LogoutCommand } from '../commands/logout.command';
import { LogoutHandler } from './logout.handler';
import { clearRefreshToken } from '../repository/auth.repository';

jest.mock('../repository/auth.repository', () => ({
  clearRefreshToken: jest.fn(),
}));

const mockClearRefreshToken = clearRefreshToken as jest.MockedFunction<typeof clearRefreshToken>;

describe('LogoutHandler', () => {
  let handler: LogoutHandler;

  beforeEach(() => {
    handler = new LogoutHandler();

    jest.clearAllMocks();
  });

  test('should have correct command type', () => {
    expect(handler.commandType).toBe('LOGOUT');
  });

  test('should successfully clear refresh token when valid publicId is provided', async () => {
    const mockPublicId = 'user-public-id';
    const command = new LogoutCommand({ publicId: mockPublicId });

    await handler.execute(command);

    expect(mockClearRefreshToken).toHaveBeenCalledWith(mockPublicId);
    expect(mockClearRefreshToken).toHaveBeenCalledTimes(1);
  });

  test('should propagate error when clearRefreshToken fails', async () => {
    const mockPublicId = 'user-public-id';
    const command = new LogoutCommand({ publicId: mockPublicId });
    const mockError = new Error('Database error');
    mockClearRefreshToken.mockRejectedValue(mockError);

    await expect(handler.execute(command)).rejects.toThrow(mockError);
    expect(mockClearRefreshToken).toHaveBeenCalledWith(mockPublicId);
    expect(mockClearRefreshToken).toHaveBeenCalledTimes(1);
  });
});
