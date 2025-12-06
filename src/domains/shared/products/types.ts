export const productType = {
  Bottle: 'bottle',
  Preform: 'preform',
  Cap: 'cap',
  Nylon: 'nylon',
};

export type ProductType = (typeof productType)[keyof typeof productType];
