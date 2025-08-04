import { NotFoundError } from '@/errors/not-found.error';
import { findUserByEmail } from '../../user/repository/user.repository';
import type { IInvitationRequestPayload } from '../models/invitation.model';
import { prisma } from '@/config/db';
import { findOrganizationByPublicId } from '../../organizations/organization/repository/organization.repository';
import { BadRequestError } from '@/errors/bad-request.error';

export const cancelUserInvitation = async (data: IInvitationRequestPayload) => {
  const { email, organizationId } = data;

  const user = await findUserByEmail(email);

  if (!user) {
    throw new NotFoundError('User not found!');
  }

  const organization = await findOrganizationByPublicId(organizationId);

  const membership = await prisma.organizationMember.findFirst({
    where: {
      userId: user.id,
      organizationId: organization.id,
    },
  });

  if (!membership) {
    throw new NotFoundError('Membership in organization not found');
  }

  if (membership.status !== 'PENDING') {
    throw new BadRequestError('User is not in PENDING status');
  }

  await prisma.$transaction(async tx => {
    await tx.activationToken.deleteMany({
      where: { userId: user.id, used: false },
    });

    await tx.organizationMember.update({
      where: { id: membership.id },
      data: {
        status: 'CANCELLED',
        statusChangedAt: new Date(),
      },
    });
  });
};

export const sendInvitationUser = async (data: IInvitationRequestPayload) => {
  const { email, organizationId } = data;

  const user = await findUserByEmail(email);
  if (!user) {
    throw new NotFoundError('User not found!');
  }

  const organization = await findOrganizationByPublicId(organizationId);

  const membership = await prisma.organizationMember.findFirst({
    where: {
      userId: user.id,
      organizationId: organization.id,
    },
  });

  if (!membership) {
    throw new NotFoundError('Membership in organization not found');
  }

  if (!['PENDING', 'CANCELLED'].includes(membership.status)) {
    throw new BadRequestError('Cannot resend invitation for this user status');
  }

  if (membership.status === 'CANCELLED') {
    await prisma.organizationMember.update({
      where: { id: membership.id },
      data: {
        status: 'PENDING',
        statusChangedAt: new Date(),
      },
    });
  }

  return {
    userId: user.id,
    userPublicId: user.public_id,
    organizationPublicId: organizationId,
    email: user.email,
  };
};
