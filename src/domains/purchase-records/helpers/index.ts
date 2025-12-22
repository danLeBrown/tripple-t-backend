export function calculateTotalPrice(data: {
  quantity_in_bags: number;
  price_per_bag: number;
}) {
  const { quantity_in_bags, price_per_bag } = data;

  return quantity_in_bags * price_per_bag;
}
