import { Body, Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { CreateTagDto } from './dto/create-tag.dto';
import { TagDto } from './dto/tag.dto';
import { TagsService } from './tags.service';

@ApiBearerAuth()
@ApiTags('Tags')
@Controller({
  version: '1',
  path: 'tags',
})
export class TagsController {
  constructor(private tagsService: TagsService) {}

  @ApiOkResponse({
    type: TagDto,
  })
  async create(
    @Body()
    dto: CreateTagDto,
  ) {
    const data = await this.tagsService.create(dto);
    return {
      data: data.toDto(),
    };
  }
}
