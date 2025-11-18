import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CoursesModule } from '../course/course.module';
import { CartRepository } from './cart.repository';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { UsersRepository } from '../users/users.repository';
import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/user.entity';
import { MailModule } from 'src/mail/mail.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart]),
    CoursesModule,
    TypeOrmModule.forFeature([User]),
    MailModule,
    SettingsModule
  ],
  providers: [CartService, CartRepository, UsersRepository],
  controllers: [CartController],
  exports: [CartRepository, CartService],
})
export class CartModule {}
