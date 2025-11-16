export function sortActivityByUserCount(
  userActivity: Record<string, { name: string; total: number }>,
) {
  return Object.values(userActivity).sort((a, b) => b.total - a.total);
}

export function groupByLabel<T, K extends keyof T & string>(
  entity: T[],
  label: K,
) {
  return entity.reduce(
    (acc, item) => {
      const key = String(item[label]);
      acc[key] = Number(acc[key] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
}

const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function getMonthNameFromNumber(month: number) {
  return monthNames[month - 1] || '';
}
