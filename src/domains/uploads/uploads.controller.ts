import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';

import { PaginatedDto } from '@/common/dto/paginated.dto';
import { AuditLog } from '@/decorators/audit-log.decorator';

import { UnauthenticatedRoute } from '../../decorators/unauthenticated.decorator';
import { CreateUploadDto } from './dto/create-upload.dto';
import {
  GenerateSignedUrlForDownloadDto,
  GenerateSignedUrlForUploadDto,
} from './dto/generate-signed-url.dto';
import { SearchAndPaginateUploadDto } from './dto/query-and-paginate-upload.dto';
import { UploadDto } from './dto/upload.dto';
import { UploadsService } from './uploads.service';

@ApiBearerAuth()
@ApiTags('Uploads')
@Controller({
  path: 'uploads',
  version: '1',
})
export class UploadsController {
  constructor(private uploadsService: UploadsService) {}

  @ApiOkResponse({
    description: 'Create upload after uploading on the client side',
    type: UploadDto,
  })
  @Post()
  async create(@Body() dto: CreateUploadDto) {
    const upload = await this.uploadsService.create(dto);
    return {
      data: upload.toDto(),
    };
  }

  @ApiOkResponse({
    description: 'Upload file',
    type: UploadDto,
  })
  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Body('name')
    name: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: '(jpg|jpeg|png|pdf)',
        })
        .addMaxSizeValidator({
          maxSize: 10_000_000,
        })
        .build({
          fileIsRequired: true,
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    if (!name) {
      throw new BadRequestException('Name is required for the upload.');
    }

    const upload = await this.uploadsService.upload(name, file);

    return {
      data: upload.toDto(),
    };
  }

  @ApiOkResponse({
    description: 'Get presigned URL for uploading a file',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          description: 'Presigned URL for uploading a file',
          properties: {
            url: {
              type: 'string',
              description: 'The presigned URL for the file',
              example:
                'https://your-bucket.s3.amazonaws.com/your-file-key?AWSAccessKeyId=...&Expires=...&Signature=...',
            },
            key: {
              type: 'string',
              description: 'The key of the file in the storage bucket',
              example: '2023/10/random-file-key.jpg',
            },
          },
        },
      },
    },
  })
  @UnauthenticatedRoute()
  @Post('presigned-url/upload')
  async generateUploadPresignedURL(@Body() dto: GenerateSignedUrlForUploadDto) {
    const data = await this.uploadsService.presignedURL({
      action: 'upload',
      file_mimetype: dto.file_mimetype,
    });

    return {
      data,
    };
  }

  @ApiOkResponse({
    description: 'Get presigned URL for downloading a file',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          description: 'Presigned URL for downloading a file',
          properties: {
            url: {
              type: 'string',
              description: 'The presigned URL for the file',
              example:
                'https://your-bucket.s3.amazonaws.com/your-file-key?AWSAccessKeyId=...&Expires=...&Signature=...',
            },
            key: {
              type: 'string',
              description: 'The key of the file in the storage bucket',
              example: '2023/10/random-file-key.jpg',
            },
          },
        },
      },
    },
  })
  @UnauthenticatedRoute()
  @Post('presigned-url/download')
  async presignedURLForDownload(@Body() dto: GenerateSignedUrlForDownloadDto) {
    const data = await this.uploadsService.presignedURL({
      action: 'download',
      key: dto.key,
    });

    return {
      data,
    };
  }
  @ApiOkResponse({
    description: 'Uploads retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(UploadDto) },
            },
          },
        },
      ],
    },
  })
  @AuditLog({
    action: 'Get uploads',
  })
  @Get('search')
  async search(@Query() query: SearchAndPaginateUploadDto) {
    const [data, total] = await this.uploadsService.search(query);

    return new PaginatedDto(UploadDto.collection(data), {
      total,
      page: query.page ?? 0,
      limit: query.limit ?? 0,
    });
  }
}
