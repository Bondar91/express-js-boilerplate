import type { TMemberRaw } from '../models/member.model';

export const transformMemberResponse = (member: TMemberRaw) => {
  const { user, roles, status } = member;
  const roleNames = roles.map(roleObj => roleObj.role.name);

  return {
    id: member.public_id,
    name: user.name,
    surname: user.surname,
    email: user.email,
    status,
    roles: roleNames,
  };
};
