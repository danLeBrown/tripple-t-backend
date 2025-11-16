import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsWhere, Repository } from 'typeorm';

import {
  CreateActivityDto,
  UpdateActivityDto,
} from './dto/create-activity.dto';
import { Activity } from './entities/activity.entity';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private repo: Repository<Activity>,
  ) {}

  async create(dto: CreateActivityDto) {
    return this.repo.save(this.repo.create(dto));
  }

  async findByAndLoadRelations(option?: FindManyOptions<Activity>) {
    return this.repo.find(option);
  }

  async findBy(query?: FindOptionsWhere<Activity>) {
    return this.repo.find({
      where: query,
      order: {
        created_at: 'ASC',
      },
    });
  }

  async findOneBy(query: FindOptionsWhere<Activity>) {
    const activity = await this.repo.findOne({
      where: query,
    });

    if (!activity) {
      throw new BadRequestException('Activity not found');
    }

    return activity;
  }

  async delete(id: string) {
    const activity = await this.repo.findOneBy({ id });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    return this.repo.delete(id);
  }

  async update(id: string, dto: UpdateActivityDto) {
    const activity = await this.repo.findOneBy({ id });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    return this.repo.update(id, dto);
  }
}
