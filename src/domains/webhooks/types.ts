type ObjectValues<T> = T[keyof T];

export const webhookStatus = {
  Pending: 'pending',
  Processing: 'processing',
  Processed: 'processed',
  Failed: 'failed',
} as const;

export type WebhookStatus = ObjectValues<typeof webhookStatus>;
