import { getUnixTime, subDays } from 'date-fns';

import { CreateActiveSubscriptionDto } from '@/domains/clients/club-members/active-subscription/dto/create-active-subscription.dto';
// eslint-disable-next-line max-len
import { CreateActiveSubscriptionBenefitWithoutIdDto } from '@/domains/clients/club-members/active-subscription/dto/create-active-subscription-benefit.dto';
import { CreateClubMemberDto } from '@/domains/clients/club-members/dto/create-club-member.dto';

import { IImportClientFromC9JA } from '../../../task-scheduler/interfaces/import-client';
import { CreateClientDto } from '../dto/create-client.dto';

export function createClientFromC9JA(
  clientData: IImportClientFromC9JA,
): CreateClientDto {
  return {
    first_name: clientData.first_name,
    last_name:
      clientData.last_name ??
      `Unknown ${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
    email:
      clientData.email?.toLowerCase() ??
      `Unknown ${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
    phone_number:
      clientData.phone ??
      `Unknown ${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
    is_onboarded: true,
    // Map other fields as necessary
  };
}

export function createClubMemberFromC9JA(
  client_id: string,
  clientData: NonNullable<IImportClientFromC9JA['club_connect_profile']>,
): CreateClubMemberDto {
  return {
    client_id,
    company_name: clientData.company_name,
    company_address: clientData.headquarters_address,
    job_role: clientData.job_designation,
    organization_type: clientData.organization_type,
    services: clientData.services,
    team_size: clientData.team_size,
  };
}

export function createActiveSubscriptionFromC9JA(
  client_id: string,
  clientData: NonNullable<IImportClientFromC9JA['active_subscription']>,
): CreateActiveSubscriptionDto {
  const duration_in_days = parseInt(clientData.plan.duration_in_days, 10);
  const expired_at = getUnixTime(new Date(clientData.expired_at));

  // expired_at - duration_in_days
  const activated_at = getUnixTime(
    subDays(new Date(expired_at * 1000), duration_in_days),
  );

  return {
    client_id,
    plan_name: clientData.plan.name,
    plan_description: clientData.plan.description,
    price: parseInt(clientData.plan.price_in_ngn, 10),
    duration_in_days,
    activated_at,
    expired_at,
    paused_at:
      clientData.is_paused && clientData.paused_at
        ? getUnixTime(new Date(clientData.paused_at))
        : undefined,
    terminated_at:
      clientData.is_terminated && clientData.terminated_at
        ? getUnixTime(new Date(clientData.terminated_at))
        : undefined,
    benefits: Object.keys(clientData.benefits).map(
      (key) =>
        ({
          benefit_name: key,
          used: clientData.benefits[key].used ?? undefined,
          limit: clientData.benefits[key].limit,
          duration_in_months:
            clientData.benefits[key].duration_months ?? undefined,
          percentage: clientData.benefits[key].percentage ?? undefined,
        }) satisfies CreateActiveSubscriptionBenefitWithoutIdDto,
    ),
  };
}
