import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Not } from 'typeorm';

export class CreateUserDto {
  @ApiProperty({
    description:
      'El nombre del usuario debe tener estar contemplado entre 3 y 25 caracteres',
    example: 'Gonzalo',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(70)
  name: string;

  @ApiProperty({
    description: 'El email del usuario, debe ser un email válido',
    example: 'example@gmail.com',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description:
      'La contraseña debe contener entre 8 y 15 caracteres, al menos una letra minúscula, una letra mayúscula, un número y uno de los siguientes caracteres especiales: !@#$%^&*',
    example: 'StrongPass123!',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(15)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).+$/, {
    message:
      'La contraseña debe contener al menos una letra minúscula, una letra mayúscula, un número y uno de los siguientes caracteres especiales: !@#$%^&*',
  })
  password: string;

  @ApiProperty({
    description:
      'La contraseña debe contener entre 8 y 15 caracteres, al menos una letra minúscula, una letra mayúscula, un número y uno de los siguientes caracteres especiales: !@#$%^&*',
    example: 'StrongPass123!',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(15)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).+$/, {
    message:
      'La contraseña debe contener al menos una letra minúscula, una letra mayúscula, un número y uno de los siguientes caracteres especiales: !@#$%^&*',
  })
  confirmPassword: string;

  @IsBoolean()
  @IsNotEmpty()
  checkBoxTerms: boolean;

  emailVerificationToken?: string; 
}
