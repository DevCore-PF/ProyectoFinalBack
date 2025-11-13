import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProfessorProfile } from "./entities/professor-profile.entity";
import { User } from "../users/entities/user.entity";
import { UsersModule } from "../users/users.module";
import { AuthModule } from "../auth/auth.module";
import { ProfilesRepository } from "./profiles.repository";
import { ProfilesController } from "./profiles.controller";
import { ProfilesService } from "./profiles.service";
import { CloudinaryModule } from "../cloudinary/cloudinary.module";
import { MailModule } from "src/mail/mail.module";

@Module({
    imports: [TypeOrmModule.forFeature([ProfessorProfile, User]),UsersModule, AuthModule, CloudinaryModule, MailModule],
    providers: [ProfilesRepository, ProfilesService],
    controllers: [ProfilesController]
})

export class ProfilesModule{}