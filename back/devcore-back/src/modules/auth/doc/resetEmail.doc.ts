import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody } from '@nestjs/swagger';
import { ResendVerificationDto } from '../dto/resend-verification.dto';

export function ApiResendVerificationDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Reenviar email de verificación',
      description:
        'Permite reenviar el correo electrónico de verificación a un usuario que no ha completado el proceso de verificación de su cuenta. Útil cuando el usuario no recibió el email inicial o el enlace de verificación expiró.',
    }),
    ApiBody({ type: ResendVerificationDto }),
  );
}
