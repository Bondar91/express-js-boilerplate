import type { TPrismaClientOrTransaction } from '@/config/db';
import { prisma } from '@/config/db';
import { NotFoundError } from '@/errors/not-found.error';

export const findRoleByPublicId = async (publicId: string, client: TPrismaClientOrTransaction = prisma) => {
  const role = await client.systemRole.findUnique({
    where: { public_id: publicId },
  });

  if (!role) {
    throw new NotFoundError('Role not found!');
  }

  return role;
};

export const findRolesByPublicIds = async (roleIds: string[], client: TPrismaClientOrTransaction = prisma) => {
  return await client.systemRole.findMany({
    where: {
      public_id: { in: roleIds },
    },
  });
};
