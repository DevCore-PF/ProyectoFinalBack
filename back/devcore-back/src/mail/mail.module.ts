import { MailService } from "./mail.service";
import { Module } from '@nestjs/common';

@Module({
  controllers: [],
  providers: [MailService],
  imports:[],
  exports: [MailService]
})
export class MailModule {}
