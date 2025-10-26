import { Injectable } from "@nestjs/common";
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {

    private transporter;

    constructor() {
    // Configura esto con tus credenciales (mejor desde .env)
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // Ejemplo con Gmail
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendVerificationEmail(email: string, token: string) {
    const url = `${process.env.API_URL}/auth/verify-email?token=${token}`;

    await this.transporter.sendMail({
      from: '"Tu App" <noreply@tuapp.com>',
      to: email,
      subject: 'Confirma tu cuenta DevCore',
      html: `
        <h1>¡Bienvenido a DevCore!</h1>
        <p>Por favor, haz clic en el siguiente enlace para confirmar tu email:</p>
        <a href="${url}">Confirmar mi cuenta</a>
      `,
    });
  }
}