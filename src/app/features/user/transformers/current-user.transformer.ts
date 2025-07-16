import type { TCurrentUserRow } from '../models/user.models';

export const transformCurrentUserResponse = (currentUser: TCurrentUserRow) => {
  const [firstOrgMember] = currentUser.OrganizationMember ?? [];

  return {
    id: currentUser.public_id,
    name: currentUser.name,
    surname: currentUser.surname,
    email: currentUser.email,
    organizationId: firstOrgMember?.organization?.public_id ?? null,
    organizationName: firstOrgMember?.organization?.name ?? null,
  };
};
