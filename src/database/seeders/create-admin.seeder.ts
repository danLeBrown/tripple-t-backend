import { Seeder } from '@concepta/typeorm-seeding';

import { User } from '../../domains/auth/users/entities/user.entity';
import { generateHash } from '../../helpers/hash.helper';

export class CreateAdminSeeder extends Seeder {
  async run(): Promise<void> {
    const userRepo = this.seedingSource.dataSource.getRepository(User);
    await userRepo.save(
      userRepo.create([
        {
          first_name: 'Club',
          last_name: 'Connect',
          email: 'admin@clubconnect.com',
          phone_number: '08000000000',
          password: generateHash('XLmIYxQj7R8d0mw'),
          is_admin: true,
        },
        {
          first_name: 'Ayomide',
          last_name: 'Ojo',
          email: 'ayomidedaniel00@gmail.com',
          phone_number: '08000000001',
          password: generateHash('XLmIYxQj7R8d0mw'),
          is_admin: true,
        },
      ]),
    );
  }
}
