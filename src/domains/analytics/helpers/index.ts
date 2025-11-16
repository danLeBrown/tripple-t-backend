import { Activity } from '@/domains/shared/activities/entities/activity.entity';

export function groupActivityByUser(activities: Activity[]) {
  return activities.reduce(
    (acc, activity) => {
      if (!(activity.admin_user_id in acc)) {
        acc[activity.admin_user_id] = {
          name: activity.admin_user?.toDto().full_name ?? 'Unknown user',
          total: 0,
        };
      }

      acc[activity.admin_user_id].total =
        Number(acc[activity.admin_user_id].total || 0) + 1;

      return acc;
    },
    {} as Record<string, { name: string; total: number }>,
  );
}

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
