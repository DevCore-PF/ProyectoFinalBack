import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({ example: 'Intro a NestJS' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Aprendé NestJS desde cero' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: 49.99, description: 'Course price in USD' })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  price: number;
}
