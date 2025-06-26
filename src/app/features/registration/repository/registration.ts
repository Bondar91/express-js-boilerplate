import { prisma } from '@/config/db';
import type { IRegistrationOrganizationPayload } from '../models/registration-organization.model';
import { createOrganization } from '../../organizations/organization/repository/organization.repository';
import { createUser, findUserByEmail } from '@/app/features/user/repository/user.repository';
import { ConflictError } from '@/errors/conflict.error';
import { createMemberRole, createOrganizationMember } from '../../organizations/member/repository/member.repository';
import { findRoleByPublicId } from '@/app/features/system-role/repository/system-role.repository';
import { SYSTEM_ROLE_IDS } from '@/shared/role-utils/role-utils';

export const registrationOrganization = async (data: IRegistrationOrganizationPayload) => {
  return prisma.$transaction(async tx => {
    let user = await findUserByEmail(data.email, tx);

    if (user) {
      throw new ConflictError('Member with this email already exists');
    }

    user = await createUser(
      {
        email: data.email,
        password: data.password,
      },
      tx,
    );

    const organization = await createOrganization({
      name: data.name,
      slug: data.slug!,
      active: false,
      memberId: user.public_id,
    });

    const member = await createOrganizationMember(
      {
        userId: user.id,
        organizationId: organization.id,
        status: 'PENDING',
        addedBy: user.public_id,
      },
      tx,
    );

    const role = await findRoleByPublicId(SYSTEM_ROLE_IDS.SUPER_ADMIN, tx);

    await createMemberRole(
      {
        memberId: member.id,
        roleId: role.id,
        addedBy: user.public_id,
      },
      tx,
    );

    return { organizationName: organization.name, organizationId: organization.public_id, user };
  });
};
