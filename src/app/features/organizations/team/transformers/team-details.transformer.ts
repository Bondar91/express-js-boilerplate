import { centsToPln } from '@/shared/currency-utils/currency-utils';
import type { TStaffMember, TTeamRaw } from '../models/team.model';

const TRAINER_ROLE_NAME = 'leader';
const PLAYER_ROLE_NAME = 'player';

export const transformTeamDetailsResponse = (team: TTeamRaw) => {
  // Staff
  const staff = team.members.reduce<TStaffMember[]>((acc, items) => {
    const trainerRole = items.member.roles.find(r => r.role.name === TRAINER_ROLE_NAME);
    if (trainerRole) {
      acc.push({
        id: items.member.public_id,
        name: items.member.user.name,
        surname: items.member.user.surname,
        email: items.member.user.email,
        roleId: trainerRole.role.public_id,
      });
    }
    return acc;
  }, []);

  // Members
  const members = team.members
    .filter(items => items.member.roles.some(r => r.role.name === PLAYER_ROLE_NAME))
    .map(items => ({
      id: items.member.public_id,
      name: items.member.user.name,
      surname: items.member.user.surname,
      email: items.member.user.email,
      status: items.member.status, // z OrganizationMember
      roles: items.member.roles.map(r => r.role.public_id),
      fee: items.member.fee !== null && items.member.fee !== undefined ? centsToPln(items.member.fee) : null,
    }));

  return {
    id: team.public_id,
    name: team.name,
    fee: team.fee !== undefined && team.fee !== null ? centsToPln(team.fee) : null,
    staff,
    members,
  };
};
