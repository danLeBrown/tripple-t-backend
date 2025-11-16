import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getUnixTime } from 'date-fns';
import {
  Between,
  FindManyOptions,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';

import { ActivitiesService } from '../../shared/activities/activities.service';
import { CreateActivityWithoutResourceDto } from '../../shared/activities/dto/create-activity.dto';
import { DocumentsService } from '../../shared/documents/documents.service';
import { CreateUploadDto } from '../../uploads/dto/create-upload.dto';
import { CreateClubMemberDto } from './dto/create-club-member.dto';
import {
  QueryAndPaginateClubMemberDto,
  SearchAndPaginateClubMemberDto,
} from './dto/query-and-paginate-club-member.dto';
import { UpdateClubMemberDto } from './dto/query-or-update-club-member.dto';
import { ClubMember } from './entities/club-member.entity';

@Injectable()
export class ClubMembersService {
  constructor(
    @InjectRepository(ClubMember)
    private repo: Repository<ClubMember>,
    private activitiesService: ActivitiesService,
    private documentsService: DocumentsService,
  ) {}

  async create(dto: CreateClubMemberDto) {
    if (dto.client_id) {
      const exists = await this.repo.exists({
        where: {
          client_id: dto.client_id,
        },
      });

      if (exists) {
        throw new BadRequestException(
          'Club Member already exists assigned to this client',
        );
      }
    }

    return this.repo.save(
      this.repo.create({ ...dto, status: dto.status ?? 'active' }),
    );
  }

  async findByAndLoadRelations(options: FindManyOptions<ClubMember> = {}) {
    return this.repo.find(options);
  }

  async findBy(query: QueryAndPaginateClubMemberDto) {
    const {
      from_time,
      to_time,
      limit = 0,
      page = 0,
      order_by = 'name',
      order_direction = 'asc',
      ...rest
    } = query;

    const q: FindOptionsWhere<ClubMember> = rest;

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
      q.created_at = LessThanOrEqual(getUnixTime(new Date(to_time * 1000)));
    }

    return this.repo.findAndCount({
      where: q,
      order: {
        [order_by === 'name' ? 'company_name' : 'created_at']: order_direction,
      },
      take: limit > 0 ? limit : undefined,
      skip: page && limit ? (page - 1) * limit : undefined,
    });
  }

  async search(query: SearchAndPaginateClubMemberDto) {
    const {
      query: search_query,
      from_time,
      to_time,
      limit = 0,
      page = 0,
      order_by = 'name',
      order_direction = 'asc',
    } = query;

    const qb = this.repo
      .createQueryBuilder('club_member')
      .leftJoin('clients', 'client', 'club_member.client_id = client.id');

    if (search_query) {
      qb.where('LOWER(club_member.company_name) LIKE :search_query')
        .orWhere('LOWER(client.first_name) LIKE :search_query')
        .orWhere('LOWER(client.last_name) LIKE :search_query')
        .orWhere('LOWER(client.email) LIKE :search_query')
        .orWhere('LOWER(client.phone_number) LIKE :search_query')
        .orWhere('LOWER(club_member.status) LIKE :search_query')
        .setParameter('search_query', `%${search_query.toLowerCase()}%`);
    }

    if (from_time) {
      qb.andWhere('club_member.created_at >= :from_time', {
        from_time: getUnixTime(new Date(from_time * 1000)),
      });
    }

    if (to_time) {
      qb.andWhere('club_member.created_at <= :to_time', {
        to_time: getUnixTime(new Date(to_time * 1000)),
      });
    }

    return (
      qb
        // .leftJoinAndSelect('club_member.tags', 'tags')
        // .leftJoinAndSelect('club_member.activities', 'activities')
        // .leftJoinAndSelect('club_member.documents', 'documents')
        .orderBy(
          order_by === 'name'
            ? 'club_member.company_name'
            : 'club_member.created_at',
          order_direction.toUpperCase() as 'ASC' | 'DESC',
        )
        .take(limit > 0 ? limit : undefined)
        .skip(page && limit ? (page - 1) * limit : undefined)
        .getManyAndCount()
    );
  }

  async findOneBy(query: FindOptionsWhere<ClubMember>) {
    return this.repo.findOne({
      where: query,
      relations: {
        activities: true,
        documents: true,
        client: true,
      },
    });
  }

  async findOneByOrFail(query: FindOptionsWhere<ClubMember>) {
    const clubMember = await this.findOneBy(query);

    if (!clubMember) {
      throw new NotFoundException('Club Member not found');
    }

    return clubMember;
  }

  async update(id: string, dto: UpdateClubMemberDto) {
    await this.findOneByOrFail({ id });

    if (dto.client_id) {
      const exists = await this.repo.exists({
        where: [
          {
            client_id: dto.client_id,
            id: Not(id), // Ensure the client_id is not already used by another club member
          },
        ],
      });

      if (exists) {
        throw new BadRequestException(
          'Client already assigned to another club member',
        );
      }
    }

    return this.repo.update(id, dto);
  }

  async createActivities(id: string, dtos: CreateActivityWithoutResourceDto[]) {
    const clubMember = await this.repo.findOne({ where: { id } });

    if (!clubMember) {
      throw new NotFoundException('Club Member not found');
    }

    return Promise.all(
      dtos.map(async (dto) =>
        this.activitiesService.create({
          ...dto,
          resource_id: id,
          resource_name: 'club_members',
        }),
      ),
    );
  }

  async createDocuments(id: string, dtos: CreateUploadDto[]) {
    const client = await this.repo.findOne({ where: { id } });

    if (!client) {
      throw new NotFoundException('Club Member not found');
    }

    return this.documentsService.createManyWithUrl(dtos, {
      resource_name: 'club_members',
      resource_id: id,
    });
  }

  async deleteDocument(q: { id: string; document_id: string }) {
    const { id, document_id } = q;

    const document = await this.documentsService.findOneByOrFail({
      id: document_id,
      resource_id: id,
      resource_name: 'club_members',
    });

    return this.documentsService.delete(document.id);
  }

  async createOrUpdate(dto: CreateClubMemberDto) {
    const existing = await this.repo.findOne({
      where: {
        client_id: dto.client_id,
      },
    });

    if (existing) {
      await this.update(existing.id, dto);

      return { is_existing: true, club_member: existing };
    }

    return { is_existing: false, club_member: await this.create(dto) };
  }

  async count(q?: FindOptionsWhere<ClubMember>) {
    return this.repo.count({
      where: q,
    });
  }
}
