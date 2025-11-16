import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Upload } from './entities/upload.entity';
import { S3Service } from './providers';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Upload]), HttpModule],
  providers: [
    UploadsService,
    {
      provide: 'IUploadService',
      useClass: S3Service,
    },
  ],
  controllers: [UploadsController],
  exports: [UploadsService],
})
export class UploadsModule {}
