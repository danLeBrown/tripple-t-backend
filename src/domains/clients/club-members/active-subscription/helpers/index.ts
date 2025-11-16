import { hash } from 'typeorm/util/StringUtils';

import { CreateActiveSubscriptionDto } from '../dto/create-active-subscription.dto';

/**
 * Generates a hash for the active subscription data to prevent duplicate entries.
 * @param data The active subscription data.
 * @returns The generated hash.
 */
export function generateActiveSubscriptionHash(
  data: CreateActiveSubscriptionDto,
) {
  const { client_id, plan_name, activated_at, duration_in_days, expired_at } =
    data;

  /**
   * This hash is a consistent hashing of some of the active subscription data.
   * Consistent in the sense that the same input will always produce the same output.
   */
  return hash(
    JSON.stringify({
      client_id,
      plan_name,
      activated_at,
      duration_in_days,
      expired_at,
    }),
  );
}
