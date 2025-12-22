import { ProductType } from '../types';

export function generateProductName(data: {
  type: ProductType;
  size: number;
  colour: string;
  unit: string;
}) {
  return `${data.size} ${data.unit.toLowerCase()} ${data.type} ${data.colour}`;
}
