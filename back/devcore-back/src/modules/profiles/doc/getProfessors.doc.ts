import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

import { ProfessorProfile } from '../entities/professor-profile.entity';

export function ApiGetProfessorsDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener profesores',
      description:
        'Devuelve la lista de profesores. Podés filtrar por estado de aprobación (`approved`, `pending` o `rejected`). Si no se pasa el parámetro, devuelve todos.',
    }),
    ApiQuery({
      name: 'approvalStatus',
      required: false,
      type: String,
      enum: ['approved', 'pending', 'rejected'],
      description:
        'Filtra por estado de aprobación del profesor. Ejemplo: `?approvalStatus=approved` devuelve los aprobados. Si no se incluye, se devuelven todos.',
    }),
    ApiResponse({
      status: 200,
      description:
        'Lista de profesores, incluyendo su relación con el usuario.',
      type: [ProfessorProfile],
    }),
    ApiResponse({
      status: 500,
      description: 'Error interno del servidor.',
    }),
  );
}
