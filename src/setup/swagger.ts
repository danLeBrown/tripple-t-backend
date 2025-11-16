import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const setupSwagger = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('Tripple T Royal Ventures API')
    .setDescription('API for Tripple T Royal Ventures')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  // await SwaggerModule.loadPluginMetadata(metadata); // <-- here
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documentation', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
};
