import {InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UsersRepository {
    constructor(@InjectRepository(User) private userRepository: Repository<User>){}

    //Metodo que obtiene todos los usuarios de la base de datos
    async getUsers(){
        return this.userRepository.find();
    }

    //Metodo que crea un usuario nuevo en la base de datos
    async createUser(user: CreateUserDto){
        return this.userRepository.save(user);
    }

    async findUserById(id: string){
        return this.userRepository.findOneBy({id});
    }

    async findUserByEmail(email: string){
        return this.userRepository.findOneBy({email});
    }
}