import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody } from '@nestjs/swagger';
import { UpdateStudentProfileDto } from '../dto/UpdateStudentProfile.dto';

export function ApiUpdateStudentProfileDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualizar o crear perfil de estudiante',
      description:
        'Permite al usuario autenticado actualizar su perfil de estudiante. Si el perfil no existe, se crea uno nuevo. Requiere proporcionar los datos del perfil a actualizar en el cuerpo de la petición.',
    }),
    ApiBody({ type: UpdateStudentProfileDto }),
  );
}
