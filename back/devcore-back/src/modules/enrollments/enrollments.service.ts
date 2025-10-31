import { Injectable } from "@nestjs/common";
import { EnrollmentRepository } from "./enrollments.repository";

@Injectable()
export class EnrollmentService {
    constructor(private readonly enrollmentRepository:EnrollmentRepository){}

    async createEnrollmentsForUSer(userId: string, courseId: string[]){
        const enrollments = courseId.map(courseId => {
            return this.enrollmentRepository.create({
                user: {id: userId},
                course: {id: courseId},
                progress: 0,
            })
        })

        await this.enrollmentRepository.save(enrollments)
    }
}