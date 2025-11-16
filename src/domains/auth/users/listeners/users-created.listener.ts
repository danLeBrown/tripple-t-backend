import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { RolesService } from '../../authorization/roles.service';
import { IUserCreatedEvent } from '../events';

@Injectable()
export class UsersCreatedListener {
  constructor(private rolesService: RolesService) {}

  @OnEvent('user.created', {
    async: true,
    promisify: true,
  })
  async assignUserToRole(event: IUserCreatedEvent) {
    const { user, role_id } = event;

    if (!role_id) {
      return; // No role to assign
    }

    await this.rolesService.assignUserRole({
      user_id: user.id,
      role_id,
    });
  }

  @OnEvent('user.updated', {
    async: true,
    promisify: true,
  })
  async updateUserRole(event: IUserCreatedEvent) {
    const { user, role_id } = event;

    if (!role_id) {
      return; // No role to update
    }

    if (role_id === user.user_role?.role_id) {
      return; // Role is already assigned
    }

    await this.rolesService.assignUserRole({
      user_id: user.id,
      role_id,
    });
  }
}
