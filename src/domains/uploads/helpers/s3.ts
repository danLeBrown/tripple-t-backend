import { AppConfigService } from '@/app-configs/app-config.service';

export function parseS3Requirement(configService: AppConfigService) {
  if (configService.get('USE_AWS_S3') === 'true') {
    return {
      accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      bucket: configService.get<string>('AWS_BUCKET'),
      region: configService.get<string>('AWS_DEFAULT_REGION'),
      endpoint: `https://${configService.get<string>('AWS_BUCKET')}.s3.${configService.get<string>('AWS_DEFAULT_REGION')}.amazonaws.com`,
      cdnEndpoint: configService.get<string>('AWS_CLOUDFRONT_URL'),
    };
  }

  return {
    accessKeyId: configService.get<string>('SPACES_KEY'),
    secretAccessKey: configService.get<string>('SPACES_SECRET'),
    bucket: configService.get<string>('SPACES_BUCKET'),
    region: 'us-east-1', // DigitalOcean Spaces uses us-east-1 as the region
    endpoint: configService.get<string>('SPACES_ENDPOINT'),
    cdnEndpoint: configService.get<string>('SPACES_CDN_ENDPOINT'),
  };
}
