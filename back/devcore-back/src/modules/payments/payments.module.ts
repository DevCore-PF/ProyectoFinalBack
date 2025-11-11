import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CoursesModule } from '../course/course.module';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { CartModule } from '../cart/cart.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { UsersModule } from '../users/users.module';
import { MailModule } from 'src/mail/mail.module';
import { PaymentRepository } from './payments.repository';

const stripeProvider = {
  provide: 'STRIPE_CLIENT',
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const stripeSecret = configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecret) {
      throw new Error('STRIPE_SECRET_KEY is not set in configuration');
    }
    return new Stripe(stripeSecret, {
      apiVersion: '2025-10-29.clover',
    });
  },
};

@Module({
  imports: [ConfigModule,TypeOrmModule.forFeature([Payment]), CoursesModule, EnrollmentsModule,UsersModule,MailModule, CartModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, stripeProvider, PaymentRepository],
})
export class PaymentsModule {}
