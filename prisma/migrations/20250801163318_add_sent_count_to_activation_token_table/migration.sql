-- AlterEnum
ALTER TYPE "MembershipStatus" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "ActivationToken" ADD COLUMN     "sentCount" INTEGER NOT NULL DEFAULT 0;
