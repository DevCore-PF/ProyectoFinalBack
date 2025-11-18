import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CartModule } from '../cart/cart.module';
import { SettingsModule } from '../settings/settings.module';
import { MailModule } from 'src/mail/mail.module';
import { TasksService } from './task.service';

@Module({
  imports: [
    ScheduleModule.forRoot(), // 1. Activa el programador de tareas
    MailModule,       // 2. Para que TasksService pueda inyectar MailService
    CartModule,       // 3. Para que TasksService pueda inyectar CartRepository
    SettingsModule,   // 4. Para que TasksService pueda inyectar SettingsService
  ],
  providers: [
    TasksService, // 5. Declara el Cron Job como un provider
  ],
})
export class TasksModule {}