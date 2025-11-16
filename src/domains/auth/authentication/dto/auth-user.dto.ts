import { UserDto } from '@/domains/auth/users/dto/user.dto';
import { User } from '@/domains/auth/users/entities/user.entity';

export class AuthUserDto {
  user: UserDto;

  public static create(user: User) {
    return new this(user);
  }

  constructor(user: User) {
    this.user = new UserDto(user);
  }
}
