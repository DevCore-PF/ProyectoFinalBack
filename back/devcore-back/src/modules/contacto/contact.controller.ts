import { Controller, Post, Body } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactDto } from './dto/contact.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Contacto')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @ApiOperation({ summary: 'Enviar formulario de contacto' })
  @ApiResponse({ status: 201, description: 'Mensaje enviado exitosamente.' })
  async sendContact(@Body() contactDto: ContactDto) {
    return this.contactService.processContactSubmission(contactDto);
  }
}