export const supplierStatus = {
  Active: 'active',
  Inactive: 'inactive',
} as const;

export type SupplierStatus =
  (typeof supplierStatus)[keyof typeof supplierStatus];
