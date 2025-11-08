import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProfessorProfileDto {
  @ApiProperty({
    example: '546789023',
    description: 'Número de teléfono del profesor',
    required: false,
    maxLength: 20,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone: string;

  @ApiProperty({
    example: 'Desarrollador FullStack',
    description: 'Profesión u ocupación principal del profesor',
    required: true,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'La profesion es requerida' })
  @MaxLength(100)
  profession: string;

  @ApiProperty({
    example: 'BackEnd',
    description: 'Especialidad o área de expertise del profesor',
    required: true,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'La especialidad es requerida' })
  @MaxLength(100)
  speciality: string;

  @ApiProperty({
    example:
      'Desarrollador con 5 años de experiencia en tecnologías web. Apasionado por la enseñanza y la creación de contenido educativo.',
    description: 'Biografía o descripción personal del profesor',
    required: false,
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, {
    message: 'La biografia no debe exceder los 500 caracteres',
  })
  biography: string;

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Certificados (PDF, JPG, PNG, WEBP - máximo 10 archivos)',
    required: true,
  })
  certificates: Express.Multer.File[];

  @ApiProperty({
    example: '["https://linkedin.com/in/usuario","https://github.com/usuario"]',
    description:
      'Enlaces profesionales en formato JSON string (opcional - dejar vacío si no aplica)',
    required: false,
    type: String, // ⬅️ CAMBIO: String porque viene como JSON string en multipart
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value || value === '') return undefined;
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
      return undefined;
    }
  })
  @IsArray()
  @IsString({ each: true })
  @IsUrl({}, { each: true, message: 'Cada enlace debe ser una URL valida' })
  professionalLinks?: string[];

  @ApiProperty({
    example: true,
    description: 'Aceptación de términos y condiciones',
    required: true,
    type: Boolean,
  })
  @IsBoolean({ message: 'Debes aceptar los terminos y condiciones' })
  agreedToTerms: boolean;

  @ApiProperty({
    example: true,
    description: 'Confirmación de que la información proporcionada es verídica',
    required: true,
    type: Boolean,
  })
  @IsBoolean({
    message: 'Debes aceptar que la informacion proporcionada es veridica',
  })
  agreedToInfo: boolean;

  @ApiProperty({
    example: true,
    description: 'Aceptación de que el perfil será revisado para aprobación',
    required: true,
    type: Boolean,
  })
  @IsBoolean({
    message: 'Debes aceptar que tu perfil sera revisado para aprobacion',
  })
  agreedToAproveed: boolean;
}
