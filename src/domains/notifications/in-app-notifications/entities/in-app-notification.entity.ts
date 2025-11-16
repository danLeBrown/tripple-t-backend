import { Column, Entity } from 'typeorm';

import { SetDto } from '@/decorators/set-dto.decorator';

import { BaseEntity } from '../../../../common/base.entity';
import { InAppNotificationDto } from '../dto/in-app-notification.dto';

@Entity('in_app_notifications')
@SetDto(InAppNotificationDto)
export class InAppNotification extends BaseEntity<InAppNotificationDto> {
  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255 })
  message: string;

  @Column({ type: 'int', nullable: true })
  read_at: number | null;
}
