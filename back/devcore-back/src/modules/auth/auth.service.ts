import { BadRequestException, Injectable } from '@nestjs/common';

import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly userRepository: UsersRepository,
  ) {}

  async create(registerUser: CreateUserDto) {
    const userExists = await this.userRepository.findUserByEmail(
      registerUser.email,
    );
    if (userExists) {
      throw new BadRequestException('El correo electrónico ya está en uso');
    }

    if (registerUser.password !== registerUser.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    this.userService.create(registerUser);

    const { password, confirmPassword, ...userExceptionPassword } =
      registerUser;

    return registerUser;
  }

  findAll() {
    return `This action returns all auth`;
  }
}
