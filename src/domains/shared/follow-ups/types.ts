type ObjectValues<T> = T[keyof T];

export const resourceName = {
  Leads: 'leads',
  Clients: 'clients',
} as const;

export type ResourceName = ObjectValues<typeof resourceName>;

export const status = {
  Active: 'Upcoming',
  DueToday: 'Due Today',
  overDue: 'Overdue',
  Complete: 'Complete',
} as const;

export type FollowUpStatus = ObjectValues<typeof status>;
