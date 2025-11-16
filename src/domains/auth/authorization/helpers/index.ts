import { slugify } from '@/helpers/string.helper';

export function slugifyPermission(data: { subject: string; action: string }) {
  return `${slugify(data.subject)}.${slugify(data.action)}`;
}
