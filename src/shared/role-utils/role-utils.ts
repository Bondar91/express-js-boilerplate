export enum SYSTEM_ROLE_IDS {
  SUPER_ADMIN = '1358e461-b317-4e6a-a0f3-dfee74a8f71d',
  ADMIN = 'ccb7b0a0-7b2d-4c55-9d80-8a4e8b57be30',
  MANAGER = '2439e3c8-eb99-41c8-b8e4-cb6e4c3ea7c3',
  USER = 'c47eef9b-3e5b-4fef-b4eb-bcee05ac6858',
}

export const hasSuperAdminRole = (roles: string[]): boolean => {
  return roles.includes(SYSTEM_ROLE_IDS.SUPER_ADMIN);
};
