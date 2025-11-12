import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Subject } from 'rxjs';
import { Course } from 'src/modules/course/entities/course.entity';
import { Payment } from 'src/modules/payments/entities/payment.entity';
import { User } from 'src/modules/users/entities/user.entity';

@Injectable()
export class MailService {
  //metodos para nodemailer el envio de confirmacion de cuenta de correo
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  /**
   * Envía un correo para restablecer la contraseña (olvidé mi contraseña)
   */
  async sendPasswordResetEmail(email: string, name: string, token: string) {
    // 1. Esta es la URL de tu frontend donde el usuario
    //    introducirá su NUEVA contraseña.
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const userName = name;

    await this.transporter.sendMail({
      from: '"DevCore" <noreply@tuapp.com>',
      to: email,
      subject: '🔒 Restablece tu contraseña de DevCore',
      html: `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Restablece tu contraseña | DevCore</title>
      </head>
      <body
        style="
          margin: 0;
          padding: 0;
          background-color: #131425;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
            'Helvetica Neue', Arial, sans-serif;
          color: #e2e8f0;
        "
      >
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          style="padding: 40px 20px; background-color: #131425"
        >
          <tr>
            <td align="center">
              <table
                width="600"
                cellpadding="0"
                cellspacing="0"
                style="
                  background-color: #242645;
                  border-radius: 18px;
                  overflow: hidden;
                  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
                  border: 1px solid rgba(255, 255, 255, 0.05);
                  max-width: 100%;
                "
              >
                <tr>
                  <td
                    style="
                      background-color: #363968;
                      text-align: center;
                      padding: 50px 30px;
                    "
                  >
                    <img
                      src="https://res.cloudinary.com/dclx6hdpk/image/upload/v1762290639/logo2_gxkhlq.png"
                      alt="DevCore Logo"
                      style="
                        width: 120px;
                        height: auto;
                        margin-bottom: 20px;
                        border: 1px solid #8b5cf6;
                        border-radius: 12px;
                        padding: 6px;
                      "
                    />
                    <h1
                      style="
                        color: #ffffff;
                        font-size: 26px;
                        font-weight: 800;
                        margin: 0;
                      "
                    >
                      ¿Olvidaste tu contraseña?
                    </h1>
                    <p
                      style="
                        color: rgba(255, 255, 255, 0.85);
                        font-size: 15px;
                        margin: 10px 0 0;
                      "
                    >
                      No te preocupes, estamos aquí para ayudarte.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 45px 40px; background-color: #242645">
                    <p
                      style="
                        color: #d1d5db;
                        font-size: 16px;
                        line-height: 1.7;
                        margin: 0 0 25px;
                      "
                    >
                      Hola
                      <strong style="color: #a78bfa">${userName}</strong>,<br /><br />
                      Recibimos una solicitud para restablecer la contraseña de
                      tu cuenta en
                      <strong style="color: #a78bfa">DevCore</strong>.
                    </p>

                    <p
                      style="
                        color: #d1d5db;
                        font-size: 16px;
                        line-height: 1.7;
                        margin: 0 0 25px;
                      "
                    >
                      Para crear una nueva contraseña, haz clic en el botón de
                      abajo. Este enlace es válido por 1 hora.
                    </p>

                    <table
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      style="margin: 35px 0"
                    >
                      <tr>
                        <td align="center">
                          <a
                            href="${resetUrl}"
                            style="
                              display: inline-block;
                              color: #e5e7eb;
                              background: transparent;
                              text-decoration: none;
                              padding: 14px 40px;
                              border: 1px solid #a78bfa;
                              border-radius: 10px;
                              font-weight: 500;
                              font-size: 16px;
                              letter-spacing: 0.4px;
                              transition: all 0.25s ease-in-out;
                            "
                            onmouseover="this.style.background='linear-gradient(135deg,#7E4BDE 0%,#8b5cf6 100%)';"
                            onmouseout="this.style.background='transparent';"
                          >
                            Restablecer Contraseña
                          </a>
                        </td>
                      </tr>
                    </table>

                    <table
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      style="
                        background-color: #1d1f3a;
                        border-radius: 10px;
                        padding: 25px;
                        border: 1px solid rgba(255, 255, 255, 0.08);
                      "
                    >
                      <tr>
                        <td>
                          <h3
                            style="
                              margin: 0 0 12px 0;
                              color: #f0e130; /* Amarillo de advertencia */
                              font-size: 17px;
                            "
                          >
                            ⚠️ ¿No solicitaste esto?
                          </h3>
                          <p
                            style="
                              color: #d1d5db;
                              font-size: 15px;
                              line-height: 1.7;
                              margin: 0;
                            "
                          >
                            Si no solicitaste un cambio de contraseña, puedes
                            ignorar este correo de forma segura. No se ha
                            realizado ningún cambio en tu cuenta.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <p
                      style="
                        color: #a0aec0;
                        font-size: 14px;
                        line-height: 1.6;
                        margin: 35px 0 10px;
                      "
                    >
                      Si el botón no funciona, copia y pega este enlace en tu
                      navegador:
                    </p>

                    <p
                      style="
                        margin: 0;
                        padding: 15px;
                        background-color: #1d1f3a;
                        border-radius: 8px;
                        border-left: 4px solid #8b5cf6;
                        word-break: break-all;
                      "
                    >
                      <a
                        href="${resetUrl}"
                        style="
                          color: #a78bfa;
                          text-decoration: none;
                          font-size: 14px;
                        "
                        >${resetUrl}</a
                      >
                    </p>
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      background-color: #131425;
                      padding: 35px 40px;
                      text-align: center;
                    "
                  >
                    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 8px">
                      🎓 Sigue aprendiendo con
                      <strong style="color: #a78bfa">DevCore</strong>.
                    </p>
                    <p style="color: #6b7280; font-size: 13px; margin: 10px 0 0">
                      ¿Necesitás ayuda?
                      <a
                        href="mailto:devcoreacademia@gmail.com"
                        style="color: #a78bfa; text-decoration: none"
                        >Contáctanos</a
                      >
                    </p>
                    <p style="color: #8b8fa9; font-size: 12px; margin: 10px 0 0">
                      © ${new Date().getFullYear()} DevCore. Todos los derechos
                      reservados.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `,
    });
  }

  /**
   * Envia correo al usuario cuando fue baneado
   */
  async sendBannedEmail(email: string, name: string) {
    const userName = name; // Asigna el nombre a la variable de la plantilla

    await this.transporter.sendMail({
      from: '"DevCore" <noreply@tuapp.com>',
      to: email,
      subject: '⚠️ Notificación: Tu cuenta DevCore ha sido suspendida',
      html: `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Tu cuenta ha sido suspendida</title>
      </head>
      <body
        style="
          margin: 0;
          padding: 0;
          background-color: #131425;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
            'Helvetica Neue', Arial, sans-serif;
          color: #e2e8f0;
        "
      >
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          style="padding: 40px 20px; background-color: #131425"
        >
          <tr>
            <td align="center">
              <table
                width="600"
                cellpadding="0"
                cellspacing="0"
                style="
                  background-color: #242645;
                  border-radius: 18px;
                  overflow: hidden;
                  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
                  border: 1px solid rgba(255, 255, 255, 0.05);
                  max-width: 100%;
                "
              >
                <tr>
                  <td
                    style="
                      background-color: #363968;
                      text-align: center;
                      padding: 45px 30px;
                    "
                  >
                    <img
                      src="https://res.cloudinary.com/dclx6hdpk/image/upload/v1762290639/logo2_gxkhlq.png"
                      alt="DevCore Logo"
                      style="
                        width: 120px;
                        height: auto;
                        margin-bottom: 20px;
                        border: 1px solid #8b5cf6;
                        border-radius: 12px;
                        padding: 6px;
                      "
                    />
                    <h1
                      style="
                        margin: 0;
                        color: #ffffff;
                        font-size: 26px;
                        font-weight: 700;
                      "
                    >
                      Tu cuenta ha sido suspendida ⚠️
                    </h1>
                    <p
                      style="
                        margin: 10px 0 0;
                        color: rgba(255, 255, 255, 0.8);
                        font-size: 15px;
                      "
                    >
                      Queremos informarte sobre el estado actual de tu cuenta en
                      <strong style="color: #a78bfa">DevCore</strong>.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 50px 40px; background-color: #242645">
                    <p
                      style="
                        margin: 0 0 25px;
                        color: #d1d5db;
                        font-size: 16px;
                        line-height: 1.7;
                      "
                    >
                      Hola <strong style="color: #a78bfa">${userName}</strong>,
                      lamentamos informarte que tu cuenta ha sido
                      <strong style="color: #fbbf24"
                        >suspendida temporalmente</strong
                      >
                      por incumplir nuestras normas de uso.
                    </p>

                    <p
                      style="
                        margin: 0 0 25px;
                        color: #d1d5db;
                        font-size: 15px;
                        line-height: 1.7;
                      "
                    >
                      Esta medida tiene como objetivo mantener un entorno seguro y
                      respetuoso para toda nuestra comunidad. Si considerás que se
                      trata de un error, podés comunicarte con nuestro equipo de
                      soporte para solicitar una revisión.
                    </p>

                    <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  style="margin: 35px 0"
                >
                  <tr>
                    <td align="center">
                      <div
                        style="
                          display: inline-block;
                          background-color: #3b2f1e; /* Fondo marrón oscuro (para contraste con amarillo) */
                          border: 1px solid rgba(251, 191, 36, 0.4); /* Borde amarillo más suave */
                          color: #fbbf24; /* Texto amarillo/naranja suave */
                          padding: 12px 28px;
                          border-radius: 8px;
                          font-weight: 600;
                          font-size: 15px;
                        "
                      >
                        ⚠️ Estado: Cuenta suspendida 
                      </div>
                    </td>
                  </tr>
                </table>

                    <table
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      style="margin: 20px 0"
                    >
                      <tr>
                        <td align="center">
                          <a
                            href="mailto:devcoreacademia@gmail.com"
                            style="
                              display: inline-block;
                              border: 1px solid #8b5cf6;
                              color: #a78bfa;
                              text-decoration: none;
                              padding: 12px 34px;
                              border-radius: 8px;
                              font-weight: 600;
                              font-size: 15px;
                              transition: all 0.3s ease;
                            "
                            onmouseover="this.style.backgroundColor='#8b5cf6';this.style.color='#fff';"
                            onmouseout="this.style.backgroundColor='transparent';this.style.color='#a78bfa';"
                            >Contactar al soporte de DevCore</a
                          >
                        </td>
                      </tr>
                    </table>

                    <p
                      style="
                        margin: 0;
                        color: #a0aec0;
                        font-size: 14px;
                        line-height: 1.6;
                      "
                    >
                      Si la suspensión se revisa favorablemente, te notificaremos
                      por este mismo medio. Agradecemos tu comprensión y
                      colaboración 💜
                    </p>
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      background-color: #131425;
                      padding: 35px 40px;
                      text-align: center;
                    "
                  >
                    <p style="margin: 0 0 8px; color: #9ca3af; font-size: 14px">
                      El equipo de <strong style="color: #a78bfa">DevCore</strong>
                    </p>
                    <p style="margin: 10px 0 0; color: #6b7280; font-size: 13px">
                      ¿Tienes dudas?
                      <a
                        href="mailto:devcoreacademia@gmail.com"
                        style="color: #a78bfa; text-decoration: none"
                        >Contáctanos</a
                      >
                    </p>
                    <p style="margin: 10px 0 0; color: #8b8fa9; font-size: 12px">
                      © ${new Date().getFullYear()} DevCore. Todos los derechos
                      reservados.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `,
    });
  }

  /**
   * Envía un correo de confirmación de compra
   */
  async sendPurchaseConfirmation(
    user: User,
    payment: Payment,
    courses: Course[],
  ) {
    // --- 1. Preparamos las variables para la plantilla ---
    const userName = user.name;
    const orderId = payment.stripeId; // Usamos el ID de Stripe como ID de orden
    const purchaseDate = new Date(payment.createdAt).toLocaleDateString(
      'es-ES',
      {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      },
    );
    const totalAmount = `$${(payment.amount / 100).toFixed(2)} ${payment.currency.toUpperCase()}`;
    const myCoursesUrl = `${process.env.FRONTEND_URL}/dashboard`;

    // --- 2. Construimos la tabla de cursos (con el nombre del profesor) ---
    const courseListHtml = courses
      .map((course) => {
        // Obtenemos el nombre del profesor de la relación que cargamos
        const teacherName = course.professor?.user?.name || 'DevCore Academia';
        const coursePrice = `$${Number(course.price).toFixed(2)}`;

        return `
          <tr style="border-top: 1px solid rgba(255, 255, 255, 0.05)">
            <td style="padding: 12px 16px; color: #d1d5db; font-size: 15px;">
              ${course.title}
            </td>
            <td style="padding: 12px 16px; color: #9ca3af; font-size: 14px;">
              ${teacherName}
            </td>
            <td
              style="
                padding: 12px 16px;
                color: #d1d5db;
                text-align: right;
                font-size: 15px;
              "
            >
              ${coursePrice}
            </td>
          </tr>
        `;
      })
      .join('');

    // --- 3. Enviamos el email ---
    await this.transporter.sendMail({
      from: '"DevCore" <noreply@tuapp.com>',
      to: user.email,
      subject: '✅ ¡Tu compra en DevCore ha sido confirmada!',
      html: `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Compra confirmada - DevCore</title>
      </head>
      <body
        style="
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
            'Helvetica Neue', Arial, sans-serif;
          background-color: #242645;
        "
      >
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          style="background-color: #242645; padding: 40px 20px"
        >
          <tr>
            <td align="center">
              <table
                width="600"
                cellpadding="0"
                cellspacing="0"
                style="
                  background-color: #1f213f;
                  border-radius: 20px;
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
                  overflow: hidden;
                  max-width: 100%;
                "
              >
                <tr>
                  <td
                    style="
                      background-color: #363968;
                      padding: 50px 30px;
                      text-align: center;
                    "
                  >
                    <img
                      src="https://res.cloudinary.com/dclx6hdpk/image/upload/v1762290639/logo2_gxkhlq.png"
                      alt="DevCore Logo"
                      style="
                        width: 130px;
                        height: 130px;
                        margin-bottom: 20px;
                        display: inline-block;
                        border-radius: 14px;
                        border: 1px solid rgba(255, 255, 255, 0.15);
                        padding: 6px;
                      "
                    />
                    <h1
                      style="
                        margin: 0;
                        color: #f3f4f6;
                        font-size: 28px;
                        font-weight: 600;
                      "
                    >
                      ¡Compra confirmada! 🎉
                    </h1>
                    <p
                      style="
                        margin: 10px 0 0 0;
                        color: rgba(255, 255, 255, 0.85);
                        font-size: 16px;
                      "
                    >
                      Gracias por seguir aprendiendo con <strong>DevCore</strong> 🚀
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 50px 40px">
                    <p
                      style="
                        margin: 0 0 25px 0;
                        color: #e5e7eb;
                        font-size: 16px;
                        line-height: 1.7;
                      "
                    >
                      Hola <strong>${userName}</strong>, tu compra se ha completado
                      correctamente. Aquí tienes los detalles de tu pedido:
                    </p>

                    <table
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      style="
                        margin: 25px 0;
                        background-color: #2b2d4a;
                        border-radius: 10px;
                        border-left: 4px solid #7e4bde;
                        padding: 20px;
                      "
                    >
                      <tr>
                        <td style="color: #f3f4f6; font-size: 15px; padding: 6px 0">
                          <strong>🧾 ID de orden:</strong> ${orderId}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #f3f4f6; font-size: 15px; padding: 6px 0">
                          <strong>📅 Fecha de compra:</strong> ${purchaseDate}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #f3f4f6; font-size: 15px; padding: 6px 0">
                          <strong>💰 Total pagado:</strong> ${totalAmount}
                        </td>
                      </tr>
                    </table>

                    <h3
                      style="
                        margin: 30px 0 15px 0;
                        color: #f3f4f6;
                        font-size: 18px;
                        font-weight: 600;
                      "
                    >
                      Cursos incluidos en tu compra:
                    </h3>

                    <table
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      style="
                        background-color: #2b2d4a;
                        border-radius: 10px;
                        overflow: hidden;
                      "
                    >
                      <thead>
                        <tr
                          style="
                            background-color: #363968;
                            color: #e5e7eb;
                            text-align: left;
                          "
                        >
                          <th style="padding: 12px 16px">Curso</th>
                          <th style="padding: 12px 16px">Profesor</th>
                          <th style="padding: 12px 16px; text-align: right">
                            Precio
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        ${courseListHtml}
                      </tbody>
                    </table>

                    <table
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      style="margin: 45px 0 25px 0"
                    >
                      <tr>
                        <td align="center">
                          <a
                            href="${myCoursesUrl}"
                            style="
                              display: inline-block;
                              border: 1px solid rgba(243, 244, 246, 0.3);
                              background-color: transparent;
                              color: #e5e7eb;
                              text-decoration: none;
                              padding: 14px 50px;
                              border-radius: 10px;
                              font-weight: 600;
                              font-size: 17px;
                              transition: all 0.3s ease;
                            "
                            onmouseover="this.style.backgroundColor='#7E4BDE'"
                            onmouseout="this.style.backgroundColor='transparent'"
                          >
                            Ver mis cursos
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p
                      style="
                        margin: 30px 0 10px 0;
                        color: #9ca3af;
                        font-size: 14px;
                        line-height: 1.6;
                      "
                    >
                      Si el botón no funciona, copia y pega este enlace en tu
                      navegador:
                    </p>
                    <p
                      style="
                        margin: 0;
                        padding: 15px;
                        background-color: #2b2d4a;
                        border-radius: 6px;
                        border-left: 4px solid #7e4bde;
                        word-break: break-all;
                      "
                    >
                      <a
                        href="${myCoursesUrl}"
                        style="
                          color: #b19ff9;
                          text-decoration: none;
                          font-size: 14px;
                        "
                      >
                        ${myCoursesUrl}
                      </a>
                    </p>
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      background-color: #131425;
                      padding: 35px 40px;
                      text-align: center;
                    "
                  >
                    <p style="margin: 0 0 10px 0; color: #cbd5e1; font-size: 14px">
                      🎓 ¡Gracias por confiar en DevCore! Disfruta tu aprendizaje.
                    </p>
                    <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 13px">
                      ¿Tienes dudas sobre tu compra?
                      <a
                        href="mailto:devcoreacademia@gmail.com"
                        style="color: #b19ff9; text-decoration: none"
                        >Contáctanos</a
                      >
                    </p>
                    <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 12px">
                      © ${new Date().getFullYear()} DevCore. Todos los derechos
                      reservados.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
    `,
    });
  }

  async sendPasswordChangeConfirmation(email: string, token: string) {
    // 1. Apunta al NUEVO endpoint que creaste
    const url = `${process.env.API_URL}/auth/confirm-password-change?token=${token}`;

    await this.transporter.sendMail({
      from: '"DevCore" <noreply@tuapp.com>',
      to: email,
      subject: '🔒 Confirma tu cambio de contraseña en DevCore',
      html: `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmar Cambio de Contraseña</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f7fa;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; max-width: 100%;">
              
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                <img src="https://res.cloudinary.com/dclx6hdpk/image/upload/v1762290639/logo2_gxkhlq.png" 
                       alt="DevCore Logo" 
                       style="width: 140px; height: 140px; margin-bottom: 20px; display: inline-block; border-radius: 12px; background-color: rgba(255, 255, 255, 0.1); padding: 8px;">
                  <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                    Tu plataforma de cursos
                  </p>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 50px 40px;">
                  <h2 style="margin: 0 0 20px 0; color: #1a202c; font-size: 28px; font-weight: 600;">
                    Confirmación de Seguridad
                  </h2>
                  <p style="margin: 0 0 25px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                    Recibimos una solicitud para cambiar la contraseña de tu cuenta <strong>DevCore</strong>. Para completar este proceso y asegurar tu cuenta, por favor haz clic en el botón de abajo.
                  </p>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 35px 0;">
                    <tr>
                      <td align="center">
                        <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: transform 0.2s;">
                          Confirmar Cambio de Contraseña
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 30px 0 10px 0; color: #718096; font-size: 14px; line-height: 1.6;">
                    Si el botón no funciona, copia y pega este enlace en tu navegador:
                  </p>
                  <p style="margin: 0; padding: 15px; background-color: #f7fafc; border-radius: 6px; border-left: 4px solid #667eea; word-break: break-all;">
                    <a href="${url}" style="color: #667eea; text-decoration: none; font-size: 14px;">
                      ${url}
                    </a>
                  </p>
                </td>
              </tr>
              
              <tr>
                <td style="background-color: #f7fafc; padding: 30px 40px; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 0 0 15px 0; color: #718096; font-size: 14px; line-height: 1.6;">
                    <strong>¿No solicitaste este cambio?</strong><br>
                    Si no solicitaste un cambio de contraseña, puedes ignorar este correo de forma segura. Tu contraseña actual no será modificada.
                  </p>
                  <p style="margin: 0; color: #a0aec0; font-size: 13px;">
                    Este enlace expirará en 24 horas por razones de seguridad.
                  </p>
                </td>
              </tr>
              
              <tr>
                <td style="background-color: #1a202c; padding: 30px 40px; text-align: center;">
                  <p style="margin: 0 0 10px 0; color: #a0aec0; font-size: 14px;">
                    © ${new Date().getFullYear()} DevCore. Todos los derechos reservados.
                  </p>
                  <p style="margin: 0; color: #718096; font-size: 12px;">
                    ¿Necesitas ayuda? <a href="mailto:devcoreacademia@gmail.com" style="color: #667eea; text-decoration: none;">Contáctanos</a>
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `,
    });
  }

  async sendVerificationEmail(email: string, token: string) {
    // La firma del método se mantiene (email, token)
    // Tu AuthService NO necesita cambios.
    const url = `${process.env.API_URL}/auth/verify-email?token=${token}`;

    await this.transporter.sendMail({
      from: '"DevCore" <noreply@tuapp.com>',
      to: email,
      subject: '✨ Confirma tu cuenta DevCore',
      html: `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Confirma tu cuenta | DevCore</title>
      </head>
      <body
        style="
          margin: 0;
          padding: 0;
          background-color: #131425;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
            'Helvetica Neue', Arial, sans-serif;
          color: #e2e8f0;
        "
      >
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          style="padding: 40px 20px; background-color: #131425"
        >
          <tr>
            <td align="center">
              <table
                width="600"
                cellpadding="0"
                cellspacing="0"
                style="
                  background-color: #242645;
                  border-radius: 18px;
                  overflow: hidden;
                  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
                  border: 1px solid rgba(255, 255, 255, 0.05);
                  max-width: 100%;
                "
              >
                <tr>
                  <td
                    style="
                      background-color: #363968;
                      text-align: center;
                      padding: 50px 30px;
                    "
                  >
                    <img
                      src="https://res.cloudinary.com/dclx6hdpk/image/upload/v1762290639/logo2_gxkhlq.png"
                      alt="DevCore Logo"
                      style="
                        width: 120px;
                        height: auto;
                        margin-bottom: 20px;
                        border: 1px solid #8b5cf6;
                        border-radius: 12px;
                        padding: 6px;
                      "
                    />
                    <h1
                      style="
                        color: #ffffff;
                        font-size: 28px;
                        font-weight: 800;
                        margin: 0;
                      "
                    >
                      ¡Bienvenido a DevCore! 🚀
                    </h1>
                    <p
                      style="
                        color: rgba(255, 255, 255, 0.85);
                        font-size: 15px;
                        margin: 10px 0 0;
                      "
                    >
                      El lugar donde el código impulsa tu futuro.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 45px 40px; background-color: #242645">
                    
                    <p
                      style="
                        color: #d1d5db;
                        font-size: 16px;
                        line-height: 1.7;
                        margin: 0 0 30px;
                      "
                    >
                      ¡Gracias por registrarte en <strong style="color: #a78bfa">DevCore</strong>!
                      Para comenzar a explorar nuestros cursos y tu panel personal,
                      confirma tu dirección de correo electrónico haciendo clic en
                      el siguiente botón:
                    </p>
                    <table
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      style="margin: 35px 0"
                    >
                      <tr>
                        <td align="center">
                          <a
                            href="${url}"
                            style="
                              display: inline-block;
                              color: #e5e7eb;
                              background: transparent;
                              text-decoration: none;
                              padding: 14px 40px;
                              border: 1px solid #a78bfa;
                              border-radius: 10px;
                              font-weight: 500;
                              font-size: 16px;
                              letter-spacing: 0.4px;
                              transition: all 0.25s ease-in-out;
                            "
                            onmouseover="this.style.background='linear-gradient(135deg,#7a5af8 0%,#8b5cf6 100%)';"
                            onmouseout="this.style.background='transparent';"
                          >
                            Confirmar mi cuenta
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p
                      style="
                        color: #a0aec0;
                        font-size: 14px;
                        line-height: 1.6;
                        margin: 20px 0 10px;
                      "
                    >
                      Si el botón no funciona, copia y pega este enlace en tu
                      navegador:
                    </p>

                    <p
                      style="
                        margin: 0;
                        padding: 15px;
                        background-color: #1d1f3a;
                        border-radius: 8px;
                        border-left: 4px solid #8b5cf6;
                        word-break: break-all;
                      "
                    >
                      <a
                        href="${url}"
                        style="
                          color: #a78bfa;
                          text-decoration: none;
                          font-size: 14px;
                        "
                        >${url}</a
                      >
                    </p>
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      background-color: #242645;
                      border-top: 1px solid rgba(255, 255, 255, 0.08);
                      padding: 35px 40px;
                    "
                  >
                    <p
                      style="
                        color: #b0b3c4;
                        font-size: 14px;
                        margin: 0 0 10px;
                        line-height: 1.6;
                      "
                    >
                      ⚠️ Si no solicitaste esta cuenta, podés ignorar este mensaje.
                    </p>
                    <p
                      style="
                        color: #8b8fa9;
                        font-size: 13px;
                        margin: 0;
                        line-height: 1.6;
                      "
                    >
                      Por razones de seguridad, este enlace expirará en 24 horas.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      background-color: #131425;
                      padding: 35px 40px;
                      text-align: center;
                    "
                  >
                    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 8px">
                      © ${new Date().getFullYear()} DevCore. Todos los derechos
                      reservados.
                    </p>
                    <p style="color: #6b7280; font-size: 13px; margin: 0">
                      ¿Necesitás ayuda?
                      <a
                        href="mailto:devcoreacademia@gmail.com"
                        style="color: #a78bfa; text-decoration: none"
                        >Contáctanos</a
                      >
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `,
    });
  }
}
