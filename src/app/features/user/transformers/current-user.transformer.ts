import type { TCurrentUserRow } from '../models/user.models';

export const transformCurrentUserResponse = (currentUser: TCurrentUserRow) => {
  return {
    id: currentUser.public_id,
    name: currentUser.name,
    surname: currentUser.surname,
    email: currentUser.email,
  };
};
