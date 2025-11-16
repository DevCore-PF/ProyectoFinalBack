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
import { EnrollmentsModule } from "../enrollments/enrollments.module";
import { StudentProfile } from "../studentprofile/entities/studentprofile.entity";
import { StudentProfileService } from "../studentprofile/studentprofile.service";
import { StudentProfileRepository } from "../studentprofile/studentprofile.repository";
import { StudentProfileController } from "../studentprofile/studentprofile.controller";

@Module({
    imports: [TypeOrmModule.forFeature([ProfessorProfile,StudentProfile, User]),UsersModule, AuthModule, CloudinaryModule, MailModule, EnrollmentsModule],
    providers: [ProfilesRepository, ProfilesService, StudentProfileService, StudentProfileRepository],
    controllers: [ProfilesController, StudentProfileController],
    exports: [ProfilesService, StudentProfileService,ProfilesRepository, StudentProfileRepository]
})

export class ProfilesModule{}