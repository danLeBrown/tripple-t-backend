export const permissionSubject = {
  USER: 'user',
  ROLE: 'role',
  PERMISSION: 'permission',
  LEAD: 'lead',
  CLIENT: 'client',
} as const;

export type PermissionSubject =
  (typeof permissionSubject)[keyof typeof permissionSubject];

export const permissionAction = {
  CREATE: 'create',
  DELETE: 'delete',
  READ: 'read',
  UPDATE: 'update',

  EXPORT: 'export',
  IMPORT: 'import',
} as const;

export type PermissionAction =
  (typeof permissionAction)[keyof typeof permissionAction];
