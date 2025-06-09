import type { SystemRole } from '@prisma/client';
import { PrismaClient, MembershipStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Funkcja do hashowania hasła
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Interfejs dla ról z ich nazwami jako klucze
interface IRolesMap {
  [key: string]: SystemRole;
}

async function main() {
  console.log('Starting seed process...');

  const existingUsers = await prisma.user.findFirst();
  if (existingUsers) {
    console.log('Database already seeded. Skipping...');
    return;
  }

  // 1. Tworzymy przykładową organizację
  console.log('Creating Example Organization...');
  const organization = await prisma.organization.create({
    data: {
      name: 'Example Organization',
      slug: 'example-organization',
      type: 'club',
      active: true,
    },
  });
  console.log(`Created organization with ID: ${organization.id}, public_id: ${organization.public_id}`);

  // 2. Tworzymy role systemowe
  console.log('Creating system roles...');
  const roleData = [
    {
      public_id: '1358e461-b317-4e6a-a0f3-dfee74a8f71d',
      name: 'super_admin',
      description: 'Pełne uprawnienia administracyjne, zarządzanie aplikacją, użytkownikami i konfiguracją',
      permissions: JSON.stringify({
        users: { create: true, read: true, update: true, delete: true },
        roles: { create: true, read: true, update: true, delete: true },
        teams: { create: true, read: true, update: true, delete: true },
      }),
    },
    {
      public_id: 'ccb7b0a0-7b2d-4c55-9d80-8a4e8b57be30',
      name: 'admin',
      description: 'Zarządzanie użytkownikami i danymi w ramach swojego obszaru',
      permissions: JSON.stringify({
        users: { create: true, read: true, update: true, delete: false },
        roles: { create: false, read: true, update: false, delete: false },
        teams: { create: true, read: true, update: true, delete: true },
      }),
    },
    {
      public_id: '2439e3c8-eb99-41c8-b8e4-cb6e4c3ea7c3',
      name: 'leader',
      description: 'Zarządzanie zespołem oraz zawodnikami, monitoruje postępy',
      permissions: JSON.stringify({
        users: { create: false, read: true, update: false, delete: false },
        roles: { create: false, read: true, update: false, delete: false },
        teams: { create: false, read: true, update: true, delete: false },
      }),
    },
    {
      public_id: 'c47eef9b-3e5b-4fef-b4eb-bcee05ac6858',
      name: 'player',
      description: 'Użytkownik końcowy, uczestnik zespołu',
      permissions: JSON.stringify({
        users: { create: false, read: false, update: false, delete: false },
        roles: { create: false, read: false, update: false, delete: false },
        teams: { create: false, read: true, update: false, delete: false },
      }),
    },
  ];

  const roles: IRolesMap = {};

  for (const role of roleData) {
    const createdRole = await prisma.systemRole.create({
      data: {
        public_id: role.public_id,
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        organizationId: organization.id,
      },
    });
    roles[role.name] = createdRole;
    console.log(`Created role: ${role.name} with ID: ${createdRole.id}, public_id: ${createdRole.public_id}`);
  }

  // 3. Tworzymy użytkowników z różnymi rolami
  console.log('Creating users...');
  const usersData = [
    {
      name: 'Super',
      surname: 'Admin',
      email: 'superadmin@example.com',
      password: await hashPassword('password123'),
      role: 'super_admin',
      isSuperAdmin: true,
    },
    {
      name: 'Admin',
      surname: 'User',
      email: 'admin@example.com',
      password: await hashPassword('password123'),
      role: 'admin',
      isSuperAdmin: false,
    },
    {
      name: 'Leader',
      surname: 'User',
      email: 'leader@example.com',
      password: await hashPassword('password123'),
      role: 'leader',
      isSuperAdmin: false,
    },
    {
      name: 'Player',
      surname: 'User',
      email: 'player@example.com',
      password: await hashPassword('password123'),
      role: 'player',
      isSuperAdmin: false,
    },
  ];

  for (const userData of usersData) {
    const { role, isSuperAdmin, ...userProps } = userData;

    // Tworzenie użytkownika
    const user = await prisma.user.create({
      data: userProps,
    });
    console.log(`Created user: ${user.email} with ID: ${user.id}, public_id: ${user.public_id}`);

    // Tworzenie członkostwa w organizacji
    const member = await prisma.organizationMember.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        status: MembershipStatus.ACTIVE,
        isSuperAdmin,
        joinedAt: new Date(),
      },
    });
    console.log(`Added user to organization as member with ID: ${member.id}, public_id: ${member.public_id}`);

    // Przypisanie roli
    const memberRole = await prisma.memberRole.create({
      data: {
        memberId: member.id,
        roleId: roles[role].id,
        assignedAt: new Date(),
      },
    });
    console.log(`Assigned role ${role} to user ${user.email}, memberRole.public_id: ${memberRole.public_id}`);
  }

  // 4. Tworzymy przykładowy zespół
  console.log('Creating example team...');
  const team = await prisma.team.create({
    data: {
      name: 'Example Team',
      description: 'This is an example team for testing',
      organizationId: organization.id,
    },
  });
  console.log(`Created team with ID: ${team.id}, public_id: ${team.public_id}`);

  // 5. Dodajemy członków do zespołu
  const members = await prisma.organizationMember.findMany({
    where: {
      organizationId: organization.id,
    },
  });

  for (const member of members) {
    const teamMember = await prisma.teamMember.create({
      data: {
        memberId: member.id,
        teamId: team.id,
        role: member.isSuperAdmin ? 'leader' : 'player',
      },
    });
    console.log(`Added member ${member.id} to team, teamMember.public_id: ${teamMember.public_id}`);
  }

  console.log('Seed completed successfully!');
}

main()
  .catch(e => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
