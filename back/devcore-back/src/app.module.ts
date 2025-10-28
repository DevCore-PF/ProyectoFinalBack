import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import typeOrmConfig from './config/typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { LessonsModule } from './modules/lesson/lesson.module';
import { CoursesModule } from './modules/course/course.module';
import { ProfilesModule } from './modules/profiles/profiles.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development'],
      load: [typeOrmConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const typeOrmConfig = configService.get('typeorm');
        if (!typeOrmConfig) {
          throw new Error('TypeORM configuration not found');
        }
        return typeOrmConfig;
      },
    }),
    UsersModule,
    AuthModule,
    CloudinaryModule,
    LessonsModule,
    CoursesModule,
    ProfilesModule
  ],
})
export class AppModule {}
