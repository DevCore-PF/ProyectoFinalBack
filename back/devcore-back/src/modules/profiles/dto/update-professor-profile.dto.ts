import { PartialType } from '@nestjs/mapped-types';
import { CreateProfessorProfileDto } from './create-professon-profile.dto';


// PartialType toma todos los validadores de CreateProfessorProfileDto
// y los hace opcionales (añade @IsOptional() a todo).
export class UpdateProfessorProfileDto extends PartialType(
  CreateProfessorProfileDto,
) {}