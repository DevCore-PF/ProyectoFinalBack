import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendVerificationDto {
  @IsEmail({}, { message: 'Debe ser un correo electrónico válido' })
  @IsNotEmpty({ message: 'El correo electrónico no puede estar vacío' })
  email: string;
}