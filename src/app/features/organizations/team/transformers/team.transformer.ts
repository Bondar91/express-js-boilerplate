import type { TTeamRaw } from '../models/team.model';

export const transformTeamResponse = (team: TTeamRaw) => {
  return {
    id: team.public_id,
    name: team.name,
    description: team.description,
    members: team.members.map(items => ({
      name: items.member.user.name,
      surname: items.member.user.surname,
      email: items.member.user.email,
    })),
  };
};
