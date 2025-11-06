import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class SetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).+$/, {
    message: 'La contraseña no cumple los requisitos de seguridad.',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}
