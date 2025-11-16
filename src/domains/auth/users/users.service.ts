import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { getUnixTime } from 'date-fns';
import { FindOptionsWhere, Not, Repository } from 'typeorm';

import { generateHash } from '@/helpers/hash.helper';

import { CreateUserDto } from './dto/create-user.dto';
import {
  QueryAndPaginateUserDto,
  SearchAndPaginateUserDto,
} from './dto/query-and-paginate-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserSession } from './entities/user-session.entity';
import { IUserCreatedEvent } from './events';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
    @InjectRepository(UserSession)
    private sessionRepo: Repository<UserSession>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateUserDto) {
    const { role_id, ...rest } = dto;

    if (!rest.is_admin && role_id) {
      throw new BadRequestException(
        'Non-admin users cannot have a role assigned',
      );
    }

    const emailExists = await this.repo.exists({
      where: {
        email: rest.email,
      },
    });

    if (emailExists) {
      throw new BadRequestException('User already exists with this email');
    }

    const phoneExists = await this.repo.exists({
      where: {
        phone_number: rest.phone_number,
      },
    });

    if (phoneExists) {
      throw new BadRequestException(
        'User already exists with this phone number',
      );
    }

    const user = await this.repo.save(
      this.repo.create({ ...rest, password: generateHash(rest.password) }),
    );

    await this.eventEmitter.emitAsync('user.created', {
      user,
      role_id,
    } satisfies IUserCreatedEvent);

    return this.findOneByOrFail({ id: user.id });
  }

  async findBy(query: QueryAndPaginateUserDto) {
    const {
      limit = 0,
      page = 0,
      order_by = 'name',
      order_direction = 'asc',
      ...rest
    } = query;

    return this.repo.findAndCount({
      where: rest,
      order: {
        [order_by === 'name' ? 'first_name' : 'created_at']: order_direction,
      },
      relations: {
        user_role: { role: true },
      },
      take: limit > 0 ? limit : undefined,
      skip: page && limit ? (page - 1) * limit : undefined,
    });
  }

  async search(query: SearchAndPaginateUserDto) {
    const {
      query: search_query,
      from_time,
      to_time,
      limit = 0,
      page = 0,
      order_by = 'name',
      order_direction = 'asc',
    } = query;

    const qb = this.repo.createQueryBuilder('user');

    if (search_query) {
      qb.where(
        'LOWER(user.first_name) LIKE :search_query OR LOWER(user.last_name) LIKE :search_query',
      )
        .orWhere('LOWER(user.email) LIKE :search_query')
        .orWhere('user.phone_number LIKE :search_query')
        .orWhere('user.status LIKE :search_query')
        .setParameter('search_query', `%${search_query.toLowerCase()}%`);
    }

    if (from_time) {
      qb.andWhere('user.created_at >= :from_time', {
        from_time: getUnixTime(new Date(from_time * 1000)),
      });
    }

    if (to_time) {
      qb.andWhere('user.created_at <= :to_time', {
        to_time: getUnixTime(new Date(to_time * 1000)),
      });
    }

    return qb
      .orderBy(
        order_by === 'name' ? 'user.first_name' : 'user.created_at',
        order_direction.toUpperCase() as 'ASC' | 'DESC',
      )
      .take(limit > 0 ? limit : undefined)
      .skip(page && limit ? (page - 1) * limit : undefined)
      .getManyAndCount();
  }

  async findOneBy(query: FindOptionsWhere<User>) {
    return this.repo.findOne({
      where: query,
      relations: {
        user_role: { role: true },
      },
    });
  }

  async findOneByOrFail(query: FindOptionsWhere<User>) {
    const user = await this.findOneBy(query);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const { role_id, ...rest } = dto;

    const user = await this.findOneByOrFail({ id });

    if (role_id && !user.is_admin) {
      throw new BadRequestException(
        'Non-admin users cannot have a role assigned',
      );
    }

    if (dto.email) {
      const exists = await this.repo.exists({
        where: {
          email: dto.email,
          id: Not(id), // Ensure the email is not already used by another user
        },
      });

      if (exists) {
        throw new BadRequestException('Email already in use');
      }
    }

    if (dto.phone_number) {
      const exists = await this.repo.exists({
        where: {
          phone_number: dto.phone_number,
          id: Not(id), // Ensure the phone_number is not already used by another user
        },
      });

      if (exists) {
        throw new BadRequestException('Phone number already in use');
      }
    }

    const exe = await this.repo.update(id, rest);

    await this.eventEmitter.emitAsync('user.updated', {
      user: await this.findOneByOrFail({ id }),
      role_id,
    } satisfies IUserCreatedEvent);

    return exe;
  }

  async updatePassword(id: string, password: string) {
    return this.repo.update(id, { password: generateHash(password) });
  }

  async updateLastLoginAt(id: string) {
    return this.repo.update(id, { last_login_at: getUnixTime(new Date()) });
  }

  async createSession(dto: {
    user_id: string;
    ip_address?: string;
    user_agent?: string;
    refresh_token: string;
    expired_at: number;
  }) {
    return this.sessionRepo.save(
      this.sessionRepo.create({
        ...dto,
        login_at: getUnixTime(new Date()),
      }),
    );
  }

  async findSessionBy(query: FindOptionsWhere<UserSession>) {
    return this.sessionRepo.findOne({
      where: query,
    });
  }

  async findAdmins() {
    return this.repo.find({
      where: {
        is_admin: true,
      },
      relations: {
        user_role: { role: true },
      },
      order: {
        first_name: 'ASC',
      },
    });
  }

  getUserRepo() {
    return this.repo;
  }

  getSessionRepo() {
    return this.sessionRepo;
  }
}
