import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { endOfDay, getUnixTime, startOfYear } from 'date-fns';
import { FindOptionsWhere } from 'typeorm';
import { Repository } from 'typeorm/repository/Repository';

import { CreateActiveSubscriptionDto } from './dto/create-active-subscription.dto';
import { CreateActiveSubscriptionBenefitWithoutIdDto } from './dto/create-active-subscription-benefit.dto';
import { UpdateActiveSubscriptionDto } from './dto/update-active-subscription.dto';
import { ActiveSubscription } from './entities/active-subscription.entity';
import { ActiveSubscriptionBenefit } from './entities/active-subscription-benefit.entity';
import { ActiveSubscriptionCreatedEvent } from './events/active-subscription.event';
import { generateActiveSubscriptionHash } from './helpers';

@Injectable()
export class ActiveSubscriptionsService {
  constructor(
    @InjectRepository(ActiveSubscription)
    private readonly repo: Repository<ActiveSubscription>,
    @InjectRepository(ActiveSubscriptionBenefit)
    private readonly benefitRepo: Repository<ActiveSubscriptionBenefit>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateActiveSubscriptionDto): Promise<ActiveSubscription> {
    const { benefits, ...rest } = dto;

    const hash = generateActiveSubscriptionHash(dto);

    const exists = await this.repo.exists({
      where: {
        client_id: dto.client_id,
        hash,
      },
    });

    if (exists) {
      throw new BadRequestException(
        'Active subscription already exists for this client',
      );
    }

    const subscription = await this.repo.save(
      this.repo.create({ ...rest, hash }),
    );

    await this.eventEmitter.emitAsync('active-subscription.created', {
      subscription,
      benefits,
    } satisfies ActiveSubscriptionCreatedEvent);

    return subscription;
  }

  async createOrUpdateBenefits(
    subscription_id: string,
    dtos: CreateActiveSubscriptionBenefitWithoutIdDto[],
  ) {
    const subscription = await this.repo.findOne({
      where: { id: subscription_id },
      relations: { benefits: true },
    });

    if (!subscription) {
      throw new NotFoundException('Active subscription not found');
    }

    const benefitsToCreate = dtos.filter(
      (dto) =>
        !(subscription.benefits ?? []).some(
          (b) => b.benefit_name === dto.benefit_name,
        ),
    );

    const benefitsToUpdate = dtos.filter((dto) =>
      (subscription.benefits ?? []).some(
        (b) => b.benefit_name === dto.benefit_name,
      ),
    );

    await this.benefitRepo.save(
      benefitsToCreate.map((dto) =>
        this.benefitRepo.create({
          ...dto,
          active_subscription_id: subscription_id,
        }),
      ),
    );

    await Promise.all(
      benefitsToUpdate.map((dto) => {
        const existingBenefit = (subscription.benefits ?? []).find(
          (b) => b.benefit_name === dto.benefit_name,
        );
        return this.benefitRepo.save({
          ...existingBenefit,
          ...dto,
        });
      }),
    );
  }

  async update(id: string, dto: UpdateActiveSubscriptionDto) {
    const { benefits, ...rest } = dto;

    const existing = await this.repo.findOne({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Active subscription not found');
    }

    const exe = await this.repo.update(id, rest);

    await this.eventEmitter.emitAsync('active-subscription.updated', {
      subscription: existing,
      benefits: benefits ?? [],
    } satisfies ActiveSubscriptionCreatedEvent);

    return exe;
  }

  async createOrUpdate(dto: CreateActiveSubscriptionDto) {
    const existing = await this.repo.findOne({
      where: {
        client_id: dto.client_id,
        hash: generateActiveSubscriptionHash(dto),
      },
    });

    if (existing) {
      await this.update(existing.id, dto);

      return { is_existing: true, active_subscription: existing };
    }

    return { is_existing: false, active_subscription: await this.create(dto) };
  }

  async findBy(
    query: FindOptionsWhere<ActiveSubscription>,
  ): Promise<ActiveSubscription[]> {
    return this.repo.find({
      where: query,
      relations: {
        benefits: true,
      },
    });
  }

  async getRevenueTrend(): Promise<Array<{ month: number; value: number }>> {
    return (
      this.repo
        .createQueryBuilder('subscription')
        .select(
          'EXTRACT(MONTH FROM TO_TIMESTAMP(subscription.activated_at)) AS month',
        )
        // .select(
        //   "TO_CHAR(TO_TIMESTAMP(subscription.activated_at), 'Mon') AS month",
        // )
        .addSelect('SUM(subscription.price) AS value')
        .where('subscription.activated_at >= :startDate', {
          startDate: getUnixTime(startOfYear(new Date())),
        })
        .andWhere('subscription.activated_at <= :endDate', {
          endDate: getUnixTime(new Date()),
        })
        .andWhere('subscription.terminated_at IS NULL')
        .andWhere('subscription.paused_at IS NULL')
        .groupBy('month')
        .orderBy('month', 'ASC')
        .getRawMany()
    );
  }

  /**
   * Retrieves the monthly trend of client subscription activations within the current year.
   *
   * This method queries the database for the first activation date of each client,
   * counts the number of activations per month, and returns an array of objects
   * containing the month and the corresponding activation count.
   *
   * @returns {Promise<Array<{ month: number; value: number }>>}
   *   A promise that resolves to an array where each object represents a month (`month`)
   *   and the number of first-time activations (`value`) in that month.
   */
  getConversationRateTrend(): Promise<Array<{ month: number; value: number }>> {
    return this.repo
      .createQueryBuilder()
      .select(
        'EXTRACT(MONTH FROM TO_TIMESTAMP(first_activations.first_activated_at)) AS month',
      )
      .addSelect('COUNT(*) AS value')
      .from(
        (subQuery) =>
          subQuery
            .select('subscription.client_id')
            .addSelect('MIN(subscription.activated_at) AS first_activated_at')
            .from('active_subscriptions', 'subscription')
            .where('subscription.activated_at >= :startDate')
            .andWhere('subscription.activated_at <= :endDate')
            .andWhere('subscription.terminated_at IS NULL')
            .andWhere('subscription.paused_at IS NULL')
            .groupBy('subscription.client_id'),
        'first_activations',
      )
      .setParameters({
        startDate: getUnixTime(startOfYear(new Date())),
        endDate: getUnixTime(new Date()),
      })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();
  }

  async getTotalRevenue(use_only_active_subscription = true) {
    const query = this.repo
      .createQueryBuilder('subscription')
      .select('SUM(subscription.price)', 'total_revenue');

    if (use_only_active_subscription) {
      query
        .where('subscription.expired_at > :currentDate', {
          currentDate: getUnixTime(endOfDay(new Date())),
        })
        .andWhere('subscription.paused_at IS NULL')
        .andWhere('subscription.terminated_at IS NULL');
    }

    const result = await query.getRawOne();

    return parseFloat(result.total_revenue ?? '0');
  }

  getQueryToGroupTotalRevenueByClient() {
    return this.repo
      .createQueryBuilder('subscription')
      .select('subscription.client_id', 'client_id')
      .addSelect('SUM(subscription.price)', 'total_revenue')
      .groupBy('client_id');
  }

  // we're getting clients that were converted within the year
  getQueryToGroupClientsByTheirEarliestSubscription() {
    return this.repo
      .createQueryBuilder('subscription')
      .select('subscription.client_id', 'client_id')
      .addSelect('MIN(subscription.activated_at)', 'earliest_subscription')
      .where('subscription.activated_at >= :startDate', {
        startDate: getUnixTime(startOfYear(new Date())),
      })
      .andWhere('subscription.activated_at <= :endDate', {
        endDate: getUnixTime(new Date()),
      })
      .andWhere('subscription.terminated_at IS NULL')
      .andWhere('subscription.paused_at IS NULL')
      .groupBy('client_id');
  }

  getSubscriptionRepo(): Repository<ActiveSubscription> {
    return this.repo;
  }
}
