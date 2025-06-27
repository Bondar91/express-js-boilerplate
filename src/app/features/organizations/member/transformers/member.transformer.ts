import { centsToPln } from '@/shared/currency-utils/currency-utils';
import type { TMemberRaw } from '../models/member.model';

export const transformMemberResponse = (member: TMemberRaw) => {
  const { user, roles, teamMemberships, status, fee, organization } = member;
  const roleIds = roles.map(roleObj => roleObj.role.public_id);
  const teamNames = teamMemberships.map(teamObj => teamObj.team.name);

  let resolvedFee = null;
  if (fee !== null && fee !== undefined) {
    resolvedFee = centsToPln(fee);
  } else {
    const teamWithFee = teamMemberships.find(tm => tm.team && tm.team.fee !== null && tm.team.fee !== undefined);

    if (teamWithFee && teamWithFee.team.fee !== null && teamWithFee.team.fee !== undefined) {
      resolvedFee = centsToPln(teamWithFee.team.fee);
    } else if (organization && organization.fee !== null && organization.fee !== undefined) {
      resolvedFee = centsToPln(organization.fee);
    }
  }

  return {
    id: member.public_id,
    name: user.name,
    surname: user.surname,
    email: user.email,
    status,
    roles: roleIds,
    teams: teamNames,
    fee: resolvedFee,
  };
};
