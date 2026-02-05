import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import Logger from './utils/Logger';

async function bootstrap() {
  try {
    Logger.info('Starting NestJS application...');
    Logger.info(`MongoDB URI: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/clinic-store'}`);
    
    const app = await NestFactory.create(AppModule);

    // Enable CORS with explicit configuration
    app.enableCors({
      origin: true, // Allow all origins (or specify your frontend URL)
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Clinic API')
    .setDescription('Clinic management system API documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('health', 'Health check endpoints')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('products', 'Product management')
    .addTag('cart', 'Shopping cart operations')
    .addTag('categories', 'Category management')
    .addTag('doctors', 'Doctor management')
    .addTag('appointments', 'Appointment management')
    .addTag('services', 'Service management')
    .addTag('team', 'Team members management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

    const PORT = process.env.PORT || 3000;
    await app.listen(PORT);
    Logger.success(`Server is running on port http://localhost:${PORT}`);
    Logger.info(`Swagger documentation available at http://localhost:${PORT}/api`);
    Logger.info(`MongoDB connection: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/clinic-store'}`);
  } catch (error) {
    Logger.error('Failed to start application:');
    Logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  Logger.error('Unhandled error during bootstrap:');
  Logger.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
