type ObjectValues<T> = T[keyof T];

export const clubMemberStatus = {
  Active: 'active',
  AtRisk: 'at_risk',
  Inactive: 'inactive',
} as const;

export const membershipLevel = {
  Gold: 'gold',
  Silver: 'silver',
  Bronze: 'bronze',
  Platinum: 'platinum',
} as const;

export type ClubMemberStatus = ObjectValues<typeof clubMemberStatus>;
export type MembershipLevel = ObjectValues<typeof membershipLevel>;
