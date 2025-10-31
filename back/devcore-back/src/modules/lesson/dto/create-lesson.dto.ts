import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({ example: 'Lección 1: Introducción', required: true })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description:
      'Videos de la lección (máximo 5, formatos: mp4, mov, avi, webm)',
    required: false,
    maxItems: 5,
  })
  videos?: any[];

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Documentos PDF de la lección (máximo 10)',
    maxItems: 10,
    required: false,
  })
  pdfs?: any[];
}
