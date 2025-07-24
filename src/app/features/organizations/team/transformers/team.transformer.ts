import { centsToPln } from '@/shared/currency-utils/currency-utils';
import type { TStaffMember, TTeamRaw } from '../models/team.model';

const TRAINER_ROLE_NAME = 'leader';

export const transformTeamResponse = (team: TTeamRaw) => {
  const membersNumber = team.members.filter(
    items => !items.member.roles.some(r => r.role.name === TRAINER_ROLE_NAME),
  ).length;

  const staff: TStaffMember[] = team.members
    .map(items => {
      const trainerRole = items.member.roles.find(r => r.role.name === TRAINER_ROLE_NAME);
      return {
        id: items.member.public_id,
        name: items.member.user.name,
        surname: items.member.user.surname,
        email: items.member.user.email,
        roleId: trainerRole ? trainerRole.role.public_id : null,
      };
    })
    .filter(staffMember => staffMember.roleId !== null);

  return {
    id: team.public_id,
    name: team.name,
    fee: team.fee ? centsToPln(team.fee) : null,
    membersNumber,
    staff,
  };
};
