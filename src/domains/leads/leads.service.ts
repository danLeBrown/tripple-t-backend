import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { getUnixTime } from 'date-fns';
import {
  Between,
  Brackets,
  FindManyOptions,
  FindOptionsWhere,
  MoreThan,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';

import { slugify } from '@/helpers/string.helper';

import { UsersService } from '../auth/users/users.service';
import { DocumentsService } from '../shared/documents/documents.service';
import { CreateTagWithoutResourceDto } from '../shared/tags/dto/create-tag.dto';
import { TagsService } from '../shared/tags/tags.service';
import { CreateUploadDto } from '../uploads/dto/create-upload.dto';
import { CreateLeadDto } from './dto/create-lead.dto';
import {
  QueryAndPaginateLeadDto,
  SearchAndPaginateLeadDto,
} from './dto/query-and-paginate-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { Lead } from './entities/lead.entity';
import { LeadStatus } from './types';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private repo: Repository<Lead>,
    private usersService: UsersService,
    private tagsService: TagsService,
    private documentsService: DocumentsService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateLeadDto) {
    const [, exists] = await Promise.all([
      this.usersService.findOneByOrFail({
        id: dto.admin_user_id,
      }),
      this.repo.exists({
        where: [
          {
            email: dto.email,
          },
          {
            phone_number: dto.phone_number,
          },
        ],
      }),
    ]);

    if (exists) {
      throw new BadRequestException(
        'Lead already exists with this email or phone number',
      );
    }

    return this.repo.save(
      this.repo.create({ ...dto, status: dto.status ?? 'new' }),
    );
  }

  async findByAndLoadRelations(options: FindManyOptions<Lead> = {}) {
    return this.repo.find(options);
  }

  async findBy(query: QueryAndPaginateLeadDto) {
    const {
      from_time,
      to_time,
      limit = 0,
      page = 0,
      order_by = 'name',
      order_direction = 'asc',
      ...rest
    } = query;

    const q: FindOptionsWhere<Lead> = rest;

    if (from_time && to_time) {
      q.created_at = Between(
        getUnixTime(new Date(from_time * 1000)),
        getUnixTime(new Date(to_time * 1000)),
      );
    }

    if (from_time && !to_time) {
      q.created_at = MoreThanOrEqual(getUnixTime(new Date(from_time * 1000)));
    }

    if (!from_time && to_time) {
      q.created_at = MoreThan(getUnixTime(new Date(to_time * 1000)));
    }

    return this.repo.findAndCount({
      where: q,
      order: {
        [order_by === 'name' ? 'first_name' : 'created_at']: order_direction,
      },
      relations: {
        admin_user: true,
      },
      take: limit > 0 ? limit : undefined,
      skip: page && limit ? (page - 1) * limit : undefined,
    });
  }

  async search(query: SearchAndPaginateLeadDto & { ids_to_filter?: string[] }) {
    const {
      query: search_query,
      from_time,
      to_time,
      limit = 0,
      page = 0,
      order_by = 'name',
      order_direction = 'asc',
      ids_to_filter = [],
      status,
      source,
      product,
      score_tag,
      admin_user_id,
    } = query;

    const qb = this.repo.createQueryBuilder('lead');

    const conditions: Array<{ field: string; value: unknown }> = [];

    // Collect all the filter conditions that are present
    if (status) {
      conditions.push({ field: 'status', value: status });
    }
    if (source) {
      conditions.push({ field: 'source', value: source });
    }
    if (product) {
      conditions.push({ field: 'product', value: product });
    }
    if (score_tag) {
      conditions.push({ field: 'score_tag', value: score_tag });
    }
    if (admin_user_id) {
      conditions.push({ field: 'admin_user_id', value: admin_user_id });
    }

    // Handle search query first if it exists
    if (search_query) {
      qb.where(
        new Brackets((_qb) => {
          _qb
            .where('LOWER(lead.first_name) LIKE :search_query')
            .orWhere('LOWER(lead.last_name) LIKE :search_query')
            .orWhere('LOWER(lead.email) LIKE :search_query')
            .orWhere('lead.phone_number LIKE :search_query');
        }),
      ).setParameter('search_query', `%${search_query.toLowerCase()}%`);
    }

    // If we have filter conditions, add them with OR logic
    if (conditions.length > 0) {
      const parameters: Record<string, unknown> = {};
      if (search_query) {
        qb.andWhere(
          new Brackets((_qb) => {
            conditions.forEach((condition, index) => {
              const paramName = `${condition.field}${index}`;
              if (index === 0) {
                _qb.where(`lead.${condition.field} = :${paramName}`);
              } else {
                _qb.orWhere(`lead.${condition.field} = :${paramName}`);
              }
              parameters[paramName] = condition.value;
            });
          }),
        );
      } else {
        qb.where(
          new Brackets((_qb) => {
            conditions.forEach((condition, index) => {
              const paramName = `${condition.field}${index}`;
              if (index === 0) {
                _qb.where(`lead.${condition.field} = :${paramName}`);
              } else {
                _qb.orWhere(`lead.${condition.field} = :${paramName}`);
              }
              parameters[paramName] = condition.value;
            });
          }),
        );
      }
      qb.setParameters(parameters);
    }

    if (from_time) {
      qb.andWhere('lead.created_at >= :from_time', {
        from_time: getUnixTime(new Date(from_time * 1000)),
      });
    }

    if (to_time) {
      qb.andWhere('lead.created_at <= :to_time', {
        to_time: getUnixTime(new Date(to_time * 1000)),
      });
    }

    if (ids_to_filter.length > 0) {
      qb.andWhere('lead.id NOT IN (:...ids)', { ids: ids_to_filter });
    }

    return (
      qb
        .leftJoinAndSelect('lead.admin_user', 'admin_user')

        // .leftJoinAndSelect('lead.tags', 'tags')
        // .leftJoinAndSelect('lead.activities', 'activities')
        // .leftJoinAndSelect('lead.documents', 'documents')
        .orderBy(
          order_by === 'name' ? 'lead.first_name' : 'lead.created_at',
          order_direction.toUpperCase() as 'ASC' | 'DESC',
        )
        .take(limit > 0 ? limit : undefined)
        .skip(page && limit ? (page - 1) * limit : undefined)
        .getManyAndCount()
    );
  }

  async findOneBy(query: FindOptionsWhere<Lead>, should_load_relations = true) {
    return this.repo.findOne({
      where: query,
      relations: should_load_relations
        ? {
            admin_user: true,
            tags: true,
            documents: true,
          }
        : undefined,
    });
  }

  async findOneByOrFail(query: FindOptionsWhere<Lead>) {
    const lead = await this.findOneBy(query);

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    return lead;
  }

  async update(id: string, dto: UpdateLeadDto) {
    await this.findOneByOrFail({ id });

    if (dto.email) {
      const exists = await this.repo.exists({
        where: [
          {
            email: dto.email,
            id: Not(id), // Ensure the email is not already used by another lead
          },
        ],
      });

      if (exists) {
        throw new BadRequestException('Email already in use');
      }
    }

    if (dto.phone_number) {
      const exists = await this.repo.exists({
        where: [
          {
            phone_number: dto.phone_number,
            id: Not(id), // Ensure the phone_number is not already used by another lead
          },
        ],
      });

      if (exists) {
        throw new BadRequestException('Phone number already in use');
      }
    }

    const exe = await this.repo.update(id, dto);

    // await this.eventEmitter.emitAsync('lead.updated', {
    //   lead: await this.repo.findOneByOrFail({
    //     id,
    //   }),
    //   dto,
    // } satisfies LeadsUpdatedEvent);

    return exe;
  }

  async createTags(id: string, dtos: CreateTagWithoutResourceDto[]) {
    const lead = await this.repo.findOne({ where: { id } });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    return Promise.all(
      dtos.map(async (dto) => {
        const exists = await this.tagsService.getTagRepo().findOne({
          where: {
            resource_name: 'leads',
            resource_id: id,
            slug: slugify(dto.value),
          },
        });

        if (exists) {
          return exists;
        }

        return this.tagsService.create({
          ...dto,
          resource_id: id,
          resource_name: 'leads',
        });
      }),
    );
  }

  async groupByStatus(status?: LeadStatus) {
    const leads = await this.repo.find({
      select: {
        status: true,
      },
      where: status ? { status } : undefined,
    });

    const groupedData = leads.reduce(
      (acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Transform to required format
    return Object.entries(groupedData).map(([_status, count]) => ({
      status: _status,
      count,
    }));
  }

  async createDocuments(id: string, dtos: CreateUploadDto[]) {
    const lead = await this.repo.findOne({ where: { id } });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    return this.documentsService.createManyWithUrl(dtos, {
      resource_name: 'leads',
      resource_id: id,
    });
  }

  async deleteDocument(q: { id: string; document_id: string }) {
    const { id, document_id } = q;

    const document = await this.documentsService.findOneByOrFail({
      id: document_id,
      resource_id: id,
      resource_name: 'leads',
    });

    return this.documentsService.delete(document.id);
  }
}
