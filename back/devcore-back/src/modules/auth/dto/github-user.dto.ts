// src/auth/dto/google-user.dto.ts

import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

//dto para crear un usuario con google
export class GithubUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  githubId: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  image?: string;
}
