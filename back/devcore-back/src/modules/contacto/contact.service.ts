import { Injectable } from "@nestjs/common";
import { MailService } from "src/mail/mail.service";
import { ContactDto } from "./dto/contact.dto";

@Injectable()
export class ContactService {
    constructor(private readonly mailService: MailService){}

    /**
     * MEtodo envia el email de contacto
     */
    async processContactSubmission(contactDto: ContactDto){
        await this.mailService.sendContactForEmail(contactDto);

        return {mesaage: 'Mensaje Enviado Correctamente: Pronto nos pondremos en contacto.'}
    }
}