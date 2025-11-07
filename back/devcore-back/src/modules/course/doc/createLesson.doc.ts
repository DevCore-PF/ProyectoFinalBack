import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { CreateLessonDto } from 'src/modules/lesson/dto/create-lesson.dto';

export function ApiCreateLessonDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Agregar una lección a un curso',
      description:
        'Crea una nueva lección y la asocia al curso identificado por su ID. Requiere información como el título, contenido y duración de la lección.',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({ type: CreateLessonDto }),
  );
}
