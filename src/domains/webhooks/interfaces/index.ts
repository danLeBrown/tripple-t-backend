import { IImportClientFromC9JA } from '@/task-scheduler/interfaces/import-client';

export interface IC9JAWebhook {
  event: 'subscription.created' | 'subscription.updated';
  data: {
    user: IImportClientFromC9JA;
  };
}
