type ObjectValues<T> = T[keyof T];

export const leadStatus = {
  New: 'new',
  Contacted: 'contacted',
  Interested: 'interested',
  ProposalSent: 'proposal_sent',
  InNegotiation: 'in_negotiation',
  Won: 'won',
  Lost: 'lost',
} as const;

export const leadSource = {
  SocialMedia: 'social_media',
  Website: 'website',
  Event: 'event',
  Referral: 'referral',
} as const;

export const leadProduct = {
  Articles: 'articles',
  BusinessMixer: 'business_mixer',
  ClubConnect: 'club_connect',
  QuoteRequest: 'quote_request',
  AdsNg: 'ads_ng',
} as const;

export const leadScoreTag = {
  Warm: 'warm',
  Cold: 'cold',
  Hot: 'hot',
} as const;

export type LeadStatus = ObjectValues<typeof leadStatus>;
export type LeadSource = ObjectValues<typeof leadSource>;
export type LeadProduct = ObjectValues<typeof leadProduct>;
export type LeadScoreTag = ObjectValues<typeof leadScoreTag>;
