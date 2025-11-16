import { Seeder } from '@concepta/typeorm-seeding';

import { CreatePermissionDto } from '@/domains/auth/authorization/dto/create-permission.dto';
import { Permission } from '@/domains/auth/authorization/entities/permission.entity';
import { slugifyPermission } from '@/domains/auth/authorization/helpers';
import {
  permissionAction,
  permissionSubject,
} from '@/domains/auth/authorization/types';

function createDescription(action: string, subject: string): string {
  return `Allows a user to ${action} a ${subject}`;
}

function createPermission(): Array<CreatePermissionDto & { slug: string }> {
  return Object.values(permissionSubject).flatMap((subject) =>
    Object.values(permissionAction).map((action) => {
      const slug = slugifyPermission({ subject, action });
      return {
        action,
        subject,
        slug,
        description: createDescription(action, subject),
      };
    }),
  );
}

export class CreatePermissionsSeeder extends Seeder {
  async run(): Promise<void> {
    const permissionRepo =
      this.seedingSource.dataSource.getRepository(Permission);
    const existingPermissions = await permissionRepo.find();

    const permissionsToCreate = createPermission().filter(
      (newPermission) =>
        !existingPermissions.some(
          (existingPermission) =>
            existingPermission.slug === newPermission.slug,
        ),
    );

    if (permissionsToCreate.length === 0) {
      console.log('No new permissions to create.');
      return;
    }

    await permissionRepo.save(permissionRepo.create(permissionsToCreate));

    console.log(`Created ${permissionsToCreate.length} new permissions.`);
  }
}
