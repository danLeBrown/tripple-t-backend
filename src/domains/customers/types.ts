export const customerStatus = {
  Active: 'active',
  Inactive: 'inactive',
} as const;

export type CustomerStatus =
  (typeof customerStatus)[keyof typeof customerStatus];
