import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { MailModule } from 'src/mail/mail.module';


@Module({
  imports: [MailModule], // Para acceder a MailService
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}