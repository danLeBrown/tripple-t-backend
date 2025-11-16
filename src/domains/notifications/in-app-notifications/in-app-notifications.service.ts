import { InjectQueue } from '@nestjs/bullmq';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { getUnixTime } from 'date-fns';
import { In, IsNull, Not, Repository } from 'typeorm';

import { CreateInAppNotificationDto } from './dto/create-in-app-notification.dto';
import { QueryInAppNotificationDto } from './dto/query-in-app-notification.dto';
import { MarkAsReadInAppNotificationDto } from './dto/update-in-app-notification.dto';
import { InAppNotification } from './entities/in-app-notification.entity';

export class InAppNotificationsService {
  constructor(
    @InjectRepository(InAppNotification)
    private repo: Repository<InAppNotification>,
    @InjectQueue('in-app-notifications')
    private queue: Queue<InAppNotification>,
  ) {}

  async create(dto: CreateInAppNotificationDto) {
    const notification = await this.repo.save(this.repo.create(dto));

    // await this.queue.add('send-notification', notification);

    return notification;
  }

  async findAll() {
    return this.repo.find();
  }

  async findBy(query: QueryInAppNotificationDto) {
    return this.repo.find({
      where: {
        user_id: query.user_id,
        read_at: query.is_read ? Not(IsNull()) : IsNull(),
      },
    });
  }

  async markAsRead(dto: MarkAsReadInAppNotificationDto) {
    const notifications = await this.repo.find({
      where: {
        user_id: dto.user_id,
        id: In(dto.ids),
      },
    });

    if (!notifications.length) {
      throw new NotFoundException('No notifications found');
    }

    if (notifications.length !== dto.ids.length) {
      throw new BadRequestException('Some notifications not found');
    }

    return this.repo.update(
      {
        id: In(notifications.map((n) => n.id)),
      },
      { read_at: getUnixTime(new Date()) },
    );
  }
}
