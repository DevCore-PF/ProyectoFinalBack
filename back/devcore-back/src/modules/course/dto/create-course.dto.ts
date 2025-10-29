import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CourseDifficulty } from '../entities/course.entity';
import { CreateLessonDto } from 'src/modules/lesson/dto/create-lesson.dto';
import { BadRequestException } from '@nestjs/common';

export class CreateCourseDto {
  @ApiProperty({ example: 'Introducción a NestJS', required: true })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Aprendé NestJS desde cero y construí APIs profesionales.',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    example: 49.99,
    description: 'Precio del curso en USD',
    required: true,
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  price: number;

  @ApiProperty({
    example: '4h 30m',
    description: 'Duración total del curso',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  duration: string;

  @ApiProperty({
    enum: CourseDifficulty,
    example: CourseDifficulty.BEGINNER,
    description: 'Nivel de dificultad',
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(CourseDifficulty)
  difficulty: CourseDifficulty;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description:
      'Imagen de portada del curso (jpg, jpeg, png, webp — máximo 2 MB)',
    required: true,
    isArray: true,
  })
  images: any[];

  @ApiProperty({
    type: [CreateLessonDto],
    description: 'Array con las lecciones del curso',
    required: true,
  })
  @Transform(({ value }) => {
    try {
      if (typeof value === 'string') {
        return JSON.parse(value);
      }
      if (Array.isArray(value)) {
        return value;
      }
      return [];
    } catch (error) {
      throw new BadRequestException(
        'El formato de lessons es inválido. Debe ser un JSON válido.',
      );
    }
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLessonDto)
  lessons: CreateLessonDto[];
}
