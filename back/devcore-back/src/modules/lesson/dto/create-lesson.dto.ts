import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({ example: 'Lección 1: Introducción', required: true })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Contenido de la lección', required: true })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Videos de la lección (máximo 5, formatos: mp4, mov, avi)',
    required: false,
    maxItems: 5,
  })
  @IsOptional()
  videos?: any[];
}
