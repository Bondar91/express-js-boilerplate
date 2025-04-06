import type { TOrganizationRaw } from '../models/organization.models';

export const transformOrganizationResponse = (organization: TOrganizationRaw) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { OrganizationMember, id, public_id, ...rest } = organization;

  return {
    id: public_id,
    ...rest,
    members: OrganizationMember.map(member => {
      const { public_id: userPublicId, ...userRest } = member.user;
      return {
        id: userPublicId,
        ...userRest,
      };
    }),
  };
};
