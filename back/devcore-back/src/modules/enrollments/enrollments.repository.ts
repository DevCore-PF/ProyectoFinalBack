import { InjectRepository } from "@nestjs/typeorm";
import { Enrollment } from "./entities/enrollment.entity";
import { DeepPartial, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";

@Injectable()
export class EnrollmentRepository {
    constructor(@InjectRepository(Enrollment) private readonly enrollmentRepository: Repository<Enrollment>){}

    /**
     * Creamos una instancia sin guardar de enrollment
     */
    create(enrollmentData: DeepPartial<Enrollment>): Enrollment{
        return this.enrollmentRepository.create(enrollmentData)
    }

    /**
     * Guardamos la instancia
     */
    async save(enrollmentData: Enrollment | Enrollment[]): Promise<Enrollment | Enrollment[]> {
        return this.enrollmentRepository.save(enrollmentData as any)
    }
}