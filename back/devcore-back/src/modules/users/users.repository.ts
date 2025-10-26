import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository, DeepPartial } from "typeorm"; // <-- 1. Importa DeepPartial
import { CreateUserDto } from "./dto/create-user.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UsersRepository {

    constructor(@InjectRepository(User) private userRepository: Repository<User>) { }

    //Metodo que obtiene todos los usuarios de la base de datos
    async getUsers() {
        return this.userRepository.find();
    }

    //Metodo que crea un usuario nuevo en la base de datos
    // (Tu método original para registro local)
    async createUser(user: CreateUserDto) {
        // Es mejor usar create + save
        const newUser = this.userRepository.create(user);
        return this.userRepository.save(newUser);
    }

    async findUserById(id: string) {
        return this.userRepository.findOneBy({ id });
    }

    async findUserByEmail(email: string) {
        return this.userRepository.findOneBy({ email });
    }

    // --- MÉTODOS NUEVOS NECESARIOS ---

    /**
     * 2. Método 'create' (pass-through)
     * Permite a los servicios crear una instancia de la entidad User
     * (sin guardarla aún)
     */
    create(userPartialData: DeepPartial<User>): User {
        return this.userRepository.create(userPartialData);
    }

    async findUserByToken(token: string) {
        return this.userRepository.findOneBy({ emailVerificationToken: token });
    }

    /**
     * 3. Método 'save' (pass-through)
     * Permite a los servicios guardar (crear o actualizar) una entidad User
     * en la base de datos.
     */
    save(user: User): Promise<User> {
        return this.userRepository.save(user);
    }


}