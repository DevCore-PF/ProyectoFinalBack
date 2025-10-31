import { TypeOrmModule } from "@nestjs/typeorm";
import { StudentProfile } from "./entities/studentprofile.entity";
import { StudentProfileRepository } from "./studentprofile.repository";
import { StudentProfileService } from "./studentprofile.service";
import { StudentProfileController } from "./studentprofile.controller";
import { Module } from '@nestjs/common';


@Module({
  controllers: [StudentProfileController],
  providers: [StudentProfileService, StudentProfileRepository],
  imports: [TypeOrmModule.forFeature([StudentProfile])],
})
export class StudentProfileModule {}
