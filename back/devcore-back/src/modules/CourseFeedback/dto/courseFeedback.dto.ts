import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max, IsOptional, IsString } from 'class-validator';
import { Rating } from '../entities/courseFeedback.entity';

export class CreateCourseFeedbackDto {
  @ApiProperty({ example: 5, description: 'Rating del curso (1-5)' })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: Rating;

  @ApiProperty({ example: 'Excelente curso, muy claro todo.' })
  @IsOptional()
  @IsString()
  feedback?: string;
}
