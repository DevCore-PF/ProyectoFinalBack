import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  IsEnum,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Category, CourseDifficulty } from '../entities/course.entity';
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
  @ApiProperty({
    enum: Category,
    example: Category.Backend,
  })
  @IsEnum(Category, {
    message: 'La categoría debe ser válida',
  })
  @IsNotEmpty()
  category: Category;
  @ApiProperty({
    description: 'Temario del curso (títulos de las lecciones)',
    example: [
      'Introducción a NestJS',
      'Configuración del entorno',
      'Controllers y Routing',
      'Services y Dependency Injection',
      'TypeORM y Base de Datos',
      'Autenticación con JWT',
    ],
    type: [String],
    minItems: 1,
    maxItems: 50,
  })
  @IsArray({ message: 'El temario debe ser un array' })
  @ArrayMinSize(1, { message: 'Debe incluir al menos un tema' })
  @ArrayMaxSize(50, { message: 'El temario no puede tener más de 50 temas' })
  @IsString({ each: true, message: 'Cada tema debe ser un texto' })
  syllabus: string[];
  @IsNotEmpty()
  @IsEnum(CourseDifficulty)
  difficulty: CourseDifficulty;
}
