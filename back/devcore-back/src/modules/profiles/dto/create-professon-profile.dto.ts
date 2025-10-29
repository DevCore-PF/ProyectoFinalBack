import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateProfessorProfileDto {
  @ApiProperty({ example: '546789023' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone: string;

  @ApiProperty({ example: 'Desarrolador FullStack' })
  @IsString()
  @IsNotEmpty({ message: 'La profesion es requerida' })
  @MaxLength(100)
  profession: string;

  @ApiProperty({ example: 'BackEnd' })
  @IsString()
  @IsNotEmpty({ message: 'La especialidad es requerida' })
  @MaxLength(100)
  speciality: string;

  @ApiProperty({ example: 'Naci en argentina en el año 98' })
  @IsString()
  @IsOptional()
  @MaxLength(500, {
    message: 'La biografia no debe exceder los 500 caracteres',
  })
  biography: string;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  @IsUrl(
    {},
    { each: true, message: 'Cada certificado debe ser una URL valida' },
  )
  @IsNotEmpty({ message: 'Debe tener al menos 1 certificado' })
  certificates: string[];

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  @IsUrl({}, { each: true, message: 'Cada enlace debe ser una URL valida' })
  @IsOptional()
  professionalLinks: string[];

  @IsBoolean({ message: 'Debes aceptar los terminos y condiciones' })
  agreedToTerms: boolean;

  @IsBoolean({
    message: 'Debes aceptar que la informacion proporcionada es veridica',
  })
  agreedToInfo: boolean;

  @IsBoolean({
    message: 'Debes aceptar que tu perfil sera revisado para aprobacion',
  })
  agreedToAproveed: boolean;
}
