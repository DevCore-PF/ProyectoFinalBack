import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async create(@Body() createAuthDto: CreateUserDto) {
    await this.authService.create(createAuthDto);
    const { password, confirmPassword, ...userExceptionPassword } =
      createAuthDto;

    return userExceptionPassword;
  }

  @Get()
  findAll() {
    return this.authService.findAll();
  }


  
}
