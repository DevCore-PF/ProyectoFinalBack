import { Injectable } from "@nestjs/common";
import { EnrollmentRepository } from "./enrollments.repository";

@Injectable()
export class EnrollmentService {
    constructor(private readonly enrollmentRepository:EnrollmentRepository){}

    async createEnrollmentsForUser(
    userId: string, 
    enrollmentData: { courseId: string, priceInCents: number }[]
  ) {
    
    const enrollments = enrollmentData.map(data => {
      return this.enrollmentRepository.create({
        user: { id: userId },
        course: { id: data.courseId },
        progress: 0,
        priceAtPurchase: data.priceInCents / 100.0, 
      });
    });
    
    await this.enrollmentRepository.save(enrollments);
  }
}