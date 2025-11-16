import { Module } from '@nestjs/common';
import { ModerationService } from './moderation.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [ModerationService],
  exports: [ModerationService], 
})
export class ModerationModule {}
