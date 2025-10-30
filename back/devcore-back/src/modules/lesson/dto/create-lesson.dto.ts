import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({ example: 'Lección 1: Introducción', required: true })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Contenido de la lección', required: true })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description:
      'Videos de la lección (máximo 5, formatos: mp4, mov, avi, webm)',
    required: false,
    maxItems: 5,
  })
  videos?: any[];
}
