import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  IsEnum,
  IsArray,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CourseStatus, CourseDifficulty } from '../entities/course.entity';

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
  @Type(() => Number)
  price: number;

  // @ApiProperty({
  //   enum: CourseStatus,
  //   example: CourseStatus.DRAFT,
  //   description: 'Estado inicial del curso (borrador o publicado)',
  //   default: CourseStatus.DRAFT,
  // })
  // @IsEnum(CourseStatus)
  // status: CourseStatus;

  @ApiProperty({
    example: '4h 30m',
    description: 'Duración total del curso (ej: "3h 45m" o "10 horas")',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  duration: string;

  @ApiProperty({
    enum: CourseDifficulty,
    example: CourseDifficulty.BEGINNER,
    description: 'Nivel de dificultad (obligatorio)',
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(CourseDifficulty)
  difficulty: CourseDifficulty;

  @ApiProperty({
    example: ['Lección 1: Introducción', 'Lección 2: Fundamentos'],
    description: 'Array con los títulos de las lecciones del curso',
    required: true,
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => value.split(',').map((v: string) => v.trim()))
  lessons: string[];
}
