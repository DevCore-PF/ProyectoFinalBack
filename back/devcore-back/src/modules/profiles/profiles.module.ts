import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProfessorProfile } from "./professor-profile.entity";
import { User } from "../users/entities/user.entity";
import { UsersModule } from "../users/users.module";
import { AuthModule } from "../auth/auth.module";
import { ProfilesRepository } from "./profiles.repository";

@Module({
    imports: [TypeOrmModule.forFeature([ProfessorProfile, User]),UsersModule, AuthModule],
    providers: [ProfilesRepository],
    controllers: []
})

export class ProfilesModule{}