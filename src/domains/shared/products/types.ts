export const productType = {
  Bottle: 'Bottle',
  Preform: 'Preform',
  Cap: 'Cap',
  Nylon: 'Nylon',
} as const;

export type ProductType = (typeof productType)[keyof typeof productType];
