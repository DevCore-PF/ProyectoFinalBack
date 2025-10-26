import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { GoogleUserDto } from '../auth/dto/google-user.dto';
import { User } from './entities/user.entity';
import { UserRole } from './enums/user-role.enum';

@Injectable()
export class UsersService {

  constructor(private userRepository: UsersRepository,
    private readonly dataSource: DataSource
  ) {}


  async create(createUserDto: CreateUserDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      if(!hashedPassword){
        throw new BadRequestException('Error al hasehar el password')
      }

      const newUser = this.userRepository.createUser({...createUserDto, password: hashedPassword})
      
      await queryRunner.commitTransaction();
      return newUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }


  async createGoogleUser(googleUserDto: GoogleUserDto): Promise<User> {
    const { email, name, image, googleId } = googleUserDto;

    // Asumimos que tu 'userRepository' es un Repository<User> de TypeORM
    // o tiene métodos create/save.
    const newUser = this.userRepository.create({
      email,
      name,
      image,
      googleId,
      isGoogleAccount: true,  // <-- Lógica clave
      isEmailVerified: true, // <-- Lógica clave
      role: undefined, // <-- Rol por defecto
      password: undefined, // No tienen contraseña local
    });

    try {
      await this.userRepository.save(newUser);
      return newUser;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Error al guardar el nuevo usuario de Google',
      );
    }
  }


  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
