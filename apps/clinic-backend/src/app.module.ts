import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { CategoriesModule } from './categories/categories.module';
import { DoctorsModule } from './doctors/doctors.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ServicesModule } from './services/services.module';
import { HealthModule } from './health/health.module';
import Logger from './utils/Logger';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clinic-store';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    MongooseModule.forRoot(MONGODB_URI, {
      retryWrites: true,
      w: 'majority',
      retryReads: true,
      connectionFactory: (connection) => {
        connection.on('connected', () => {
          Logger.success(`MongoDB connected successfully to: ${MONGODB_URI}`);
        });
        connection.on('error', (err: Error) => {
          Logger.error(`MongoDB connection error: ${err.message}`);
        });
        connection.on('disconnected', () => {
          Logger.warn('MongoDB disconnected');
        });
        return connection;
      },
    }),
    HealthModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    CartModule,
    CategoriesModule,
    DoctorsModule,
    AppointmentsModule,
    ServicesModule,
  ],
})
export class AppModule {}
