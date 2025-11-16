import { INestApplication } from '@nestjs/common';
import path from 'path';
import _request from 'supertest';
import { AbstractStartedContainer } from 'testcontainers';

import { CreateUploadDto } from '../../src/domains/uploads/dto/create-upload.dto';
import {
  GenerateSignedUrlForDownloadDto,
  GenerateSignedUrlForUploadDto,
} from '../../src/domains/uploads/dto/generate-signed-url.dto';
import { UploadDto } from '../../src/domains/uploads/dto/upload.dto';
import { UploadsService } from '../../src/domains/uploads/uploads.service';
import {
  getCsrfToken,
  loginAdmin,
  makeAuthenticatedRequest,
  setupApplication,
} from '../setup/app';

describe('UploadsController (e2e)', () => {
  let app: INestApplication;
  let containers: AbstractStartedContainer[];
  let request: ReturnType<typeof makeAuthenticatedRequest>;
  let uploadsService: UploadsService;
  let upload: UploadDto;
  let accessToken: string;
  let csrf: {
    token: string;
    session_id: string;
  };

  beforeAll(async () => {
    [app, containers] = await setupApplication();
    csrf = await getCsrfToken(app);
    const loginResponse = await loginAdmin(app, csrf);
    accessToken = loginResponse.access_token;
    request = makeAuthenticatedRequest(app, csrf, loginResponse.access_token);

    uploadsService = app.get(UploadsService);
  });

  afterAll(async () => {
    await Promise.all([app.close(), ...containers.map((c) => c.stop())]);
  });

  it('/ (GET)', () => {
    request.get('/v1/uploads').expect(200);
  });

  describe('it should create an upload', () => {
    afterAll(async () => {
      const u = await uploadsService.findOneBy({
        id: upload.id,
      });

      expect(u).not.toBeNull();
    });

    it('/ (POST', (done) => {
      request
        .post('/v1/uploads', {
          name: 'Test Upload',
          relative_url: '2025/10/test.png',
        } satisfies CreateUploadDto)
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          upload = res.body.data;

          expect(upload).toBeDefined();
          expect(upload.name).toBe('Test Upload');
          expect(upload.relative_url).toBe('2025/10/test.png');

          return done();
        });
    });
  });

  describe('it should upload a file', () => {
    afterAll(async () => {
      const u = await uploadsService.findOneBy({
        id: upload.id,
      });

      expect(u).not.toBeNull();
    });

    it('/file (POST)', (done) => {
      _request(app.getHttpServer())
        .post('/v1/uploads/file')
        .field({
          name: 'Test File Upload',
        })
        .attach('file', path.join(__dirname, '../mock/image.png'), {
          filename: 'image.png',
          contentType: 'image/png',
        })
        .set('Authorization', `Bearer ${accessToken}`)
        .set('x-csrf-token', csrf.token)
        .set('x-session-id', csrf.session_id)
        .set('Content-Type', 'multipart/form-data')
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          upload = res.body.data;

          expect(upload).toBeDefined();
          expect(upload.name).toBe('Test File Upload');
          expect(upload.relative_url).toContain('mock-bucket');

          return done();
        });
    });
  });

  describe('it should generate a presigned URL for uploading and downloading a file', () => {
    let key: string;
    it('/presigned-url/upload (GET)', (done) => {
      request
        .post('/v1/uploads/presigned-url/upload', {
          file_mimetype: 'image/png',
        } satisfies GenerateSignedUrlForUploadDto)
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data.url).toBeDefined();
          expect(res.body.data.key).toBeDefined();
          key = res.body.data.key;
          expect(res.body.data.url).toContain('mock-s3-service.com');

          return done();
        });
    });

    it('/presigned-url/download (GET)', (done) => {
      request
        .post('/v1/uploads/presigned-url/download', {
          key,
        } satisfies GenerateSignedUrlForDownloadDto)
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data.url).toBeDefined();
          expect(res.body.data.url).toContain('mock-s3-service.com');
          expect(res.body.data.key).toBe(key);
          return done();
        });
    });
  });
});
