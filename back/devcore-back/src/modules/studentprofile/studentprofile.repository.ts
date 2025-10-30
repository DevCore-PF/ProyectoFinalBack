import { Injectable } from "@nestjs/common";
import { DeepPartial, Repository } from "typeorm";
import { StudentProfile } from "./entities/studentprofile.entity";

@Injectable()
export class StudentProfileRepository {

    constructor(private readonly studenProfileRepository: Repository<StudentProfile>){}

    create(profileData: DeepPartial<StudentProfile>){
        return this.studenProfileRepository.create(profileData);
    }

    save(profile: StudentProfile): Promise<StudentProfile> {
        return this.studenProfileRepository.save(profile)
    }

    async findByUserId(userId: string):Promise<StudentProfile | null> {
        return this.studenProfileRepository.findOne({
            where: {user: {id: userId}}
        })
    }
}