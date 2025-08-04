import type { TOrganizationRaw, TOrganizationStatisticRaw } from '../models/organization.models';

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

export const transformOrganizationStatisticResponse = (statistic: TOrganizationStatisticRaw) => {
  const { membersCount, teamsCount, invitationsSent } = statistic;

  return {
    fees: {
      monthFees: '1600,00', //@TODO - Do zmiany na pobranie wartośći z API jak będą endpointy
      overdueFees: '400,00', //@TODO - Do zmiany na pobranie wartośći z API jak będą endpointy
    },
    members: {
      activeMembersCount: membersCount,
      sentInvitations: invitationsSent, //@TODO - Do zmiany na pobranie wartośći z API jak będą endpointy
    },
    teams: {
      teamsCount: teamsCount,
    },
  };
};
