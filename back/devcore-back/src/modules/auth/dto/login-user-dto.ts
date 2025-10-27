import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

//dto para el login propio
export class LoginUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}