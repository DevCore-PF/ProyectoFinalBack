import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({ example: 'Intro a NestJS' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Aprendé NestJS desde cero' })
  @IsNotEmpty()
  @IsString()
  description: string;
}
