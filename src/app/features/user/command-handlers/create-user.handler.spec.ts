import { CreateUserHandler } from './create-user.handler';
import { CreateUserCommand } from '../commands/create-user.command';
import { createUser } from '../repository/user.repository';
import type { TUserWithoutPassword } from '../models/user.models';

jest.mock('../repository/user.repository', () => ({
  createUser: jest.fn(),
}));

const mockCreateUser = createUser as jest.MockedFunction<typeof createUser>;

const mockedUser: TUserWithoutPassword = {
  id: 1,
  public_id: '',
  name: 'User 1',
  surname: 'Surname 1',
  email: 'email@example.com',
  createdAt: new Date('2025-01-27T17:46:46.174Z'),
  updatedAt: new Date('2025-01-27T17:46:46.174Z'),
};

describe('CreateUserHandler', () => {
  let handler: CreateUserHandler;

  beforeEach(() => {
    handler = new CreateUserHandler();
    jest.clearAllMocks();
  });

  it('should create a User successfully', async () => {
    const command = new CreateUserCommand({
      name: 'User A',
      surname: 'Surname A',
      email: 'email@example.com',
      password: 'password1234',
    });

    mockCreateUser.mockResolvedValue(mockedUser);

    const result = await handler.execute(command);

    expect(mockCreateUser).toHaveBeenCalledWith({
      name: 'User A',
      surname: 'Surname A',
      email: 'email@example.com',
      password: 'password1234',
    });
    expect(result).toEqual(mockedUser);
  });
});
