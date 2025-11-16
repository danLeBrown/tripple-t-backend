export interface IImportClientFromC9JA {
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  club_connect_profile: {
    user_id: number;
    company_name: string;
    company_email: string;
    company_phone: string;
    job_designation: string;
    headquarters_address: string;
    organization_type: string;
    services: string;
    team_size: string;
  } | null;
  active_subscription: {
    plan: {
      name: string;
      description: string;
      price_in_ngn: string;
      duration_in_days: string;
    };
    is_paused: boolean;
    is_terminated: boolean;
    paused_at: string | null;
    terminated_at: string | null;
    expired_at: string;
    benefits: Record<
      string,
      {
        used?: number;
        limit: number;
        duration_months?: number; // Optional for benefits that don't have a duration
        percentage?: number; // Optional for benefits that don't have a discount
      }
    >;
  } | null;
}
