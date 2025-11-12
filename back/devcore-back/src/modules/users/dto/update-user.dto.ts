import {
  IsOptional,
  IsString,
  MaxLength,
  IsDateString,
  IsEnum,
  IsPhoneNumber,
  ValidateIf,
  Matches,
  IsEmpty,
  IsDate,
} from 'class-validator';
import { Gender } from '../entities/user.entity';
import { Transform, Type } from 'class-transformer';

export class UpdateUserProfileDto {
  @IsOptional()
  @Transform(({ value }) => value || undefined)
  @IsString({ message: 'La ciudad debe ser un texto válido' })
  @MaxLength(100, { message: 'La ciudad no puede tener más de 100 caracteres' })
  ciudad?: string;

  @IsOptional()
  @Transform(({ value }) => value || undefined)
  @IsString({ message: 'La dirección debe ser un texto válido' })
  @MaxLength(200, {
    message: 'La dirección no puede tener más de 200 caracteres',
  })
  direccion?: string;

  @IsOptional()
  @Transform(({ value }) => value || undefined)
  @IsString({ message: 'El DNI debe ser un texto válido' })
  @MaxLength(20, { message: 'El DNI no puede tener más de 20 caracteres' })
  dni?: string;

  @IsOptional()
  @Transform(({ value }) => value || undefined)
  @ValidateIf((o) => o.telefono !== '' && o.telefono !== null)
  @Matches(
    /^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/,
    {
      message: 'El teléfono debe tener un formato válido',
    },
  )
  telefono?: string;

  @IsOptional()
  @Transform(({ value }) => value || undefined)
  @Type(() => Date)
  @IsDate({ message: 'Debe ser una fecha valida' })
  fechaNacimiento?: Date;

  @IsOptional()
  @ValidateIf((o) => o.genero !== '' && o.genero !== null)
  @IsEnum(Gender, { message: 'El género debe ser masculino, femenino u otro' })
  genero?: Gender;
}
