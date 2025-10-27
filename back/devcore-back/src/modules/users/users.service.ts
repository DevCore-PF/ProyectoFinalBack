import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private userRepository: UsersRepository,
    private readonly dataSource: DataSource,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      if (!hashedPassword) {
        throw new BadRequestException('Error al hasehar el password');
      }

      const newUser = this.userRepository.createUser({
        ...createUserDto,
        password: hashedPassword,
      });

      await queryRunner.commitTransaction();
      return newUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateUserImage(id: string, imageUrl: string) {
    try {
      const user = await this.userRepository.getById(id);
      if (!user) throw new NotFoundException('Usuario no encontrado');

      user.image = imageUrl;
      return await this.userRepository.saveUser(user);
    } catch (error) {
      console.error('Error actualizando imagen del usuario:', error);
      throw new InternalServerErrorException(
        'Error al actualizar la imagen del usuario',
      );
    }
  }

  async getAllUser() {
    return await this.userRepository.getAll();
  }

  async getUserById(id: string) {
    return await this.userRepository.getById(id);
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async deleteUser(id: string) {
    return await this.userRepository.deleteUserRepo(id);
  }
}
