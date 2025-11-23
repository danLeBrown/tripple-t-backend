import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getUnixTime } from 'date-fns';
import { FindOptionsWhere, Repository } from 'typeorm';

import { CreateExpenseDto } from './dto/create-expense.dto';
import {
  QueryAndPaginateExpenseDto,
  SearchAndPaginateExpenseDto,
} from './dto/query-and-paginate-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Expense } from './entities/expense.entity';

@Injectable()
export class ExpensesService {
  @InjectRepository(Expense)
  private readonly repo: Repository<Expense>;

  async create(dto: CreateExpenseDto) {
    const expense = this.repo.create(dto);

    return this.repo.save(expense);
  }

  async findBy(query: QueryAndPaginateExpenseDto) {
    const { limit = 0, page = 0 } = query;

    return this.repo.findAndCount({
      //   where: rest,
      order: {
        created_at: 'DESC',
      },
      take: limit > 0 ? limit : undefined,
      skip: page && limit ? (page - 1) * limit : undefined,
    });
  }

  async search(query: SearchAndPaginateExpenseDto) {
    const {
      query: search_query,
      from_time,
      to_time,
      limit = 0,
      page = 0,
    } = query;

    const qb = this.repo.createQueryBuilder('expense');

    if (search_query) {
      qb.where(
        'LOWER(expense.narration) LIKE :search_query OR CAST(expense.amount AS TEXT) LIKE :search_query',
      ).setParameter('search_query', `%${search_query.toLowerCase()}%`);
    }

    if (from_time) {
      qb.andWhere('expense.created_at >= :from_time', {
        from_time: getUnixTime(new Date(from_time * 1000)),
      });
    }

    if (to_time) {
      qb.andWhere('expense.created_at <= :to_time', {
        to_time: getUnixTime(new Date(to_time * 1000)),
      });
    }

    return qb
      .orderBy('expense.created_at', 'DESC')
      .take(limit > 0 ? limit : undefined)
      .skip(page && limit ? (page - 1) * limit : undefined)
      .getManyAndCount();
  }

  async findOneBy(query: FindOptionsWhere<Expense>) {
    return this.repo.findOne({
      where: query,
    });
  }

  async findOneByOrFail(query: FindOptionsWhere<Expense>) {
    const expense = await this.findOneBy(query);

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return expense;
  }

  async update(id: string, dto: UpdateExpenseDto) {
    const expense = await this.findOneByOrFail({ id });

    return this.repo.update(expense.id, dto);
  }
}
