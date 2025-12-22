import { Injectable } from '@nestjs/common';

@Injectable()
export class AnalyticsService {
  static readonly RECENT_ACTIVITIES_LIMIT = 10;

  USERS_TABLE = 'users';
  ROLES_TABLE = 'roles';
  USER_ROLES_TABLE = 'user_roles';
}
