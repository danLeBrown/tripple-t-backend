export const EXPENSE_CATEGORIES = {
  Utility: 'utility',
  OfficeSupplies: 'office_supplies',
  SALARY: 'salary',
  Maintenance: 'maintenance',
  Miscellaneous: 'miscellaneous',
  BONUS: 'bonus',
  ALLOWANCES: 'allowances',
} as const;

export type ExpenseCategory =
  (typeof EXPENSE_CATEGORIES)[keyof typeof EXPENSE_CATEGORIES];
