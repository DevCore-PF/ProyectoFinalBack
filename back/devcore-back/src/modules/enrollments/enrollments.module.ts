import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Enrollment } from "./entities/enrollment.entity";
import { EnrollmentService } from "./enrollments.service";
import { EnrollmentRepository } from "./enrollments.repository";

@Module({
    imports: [
        TypeOrmModule.forFeature([Enrollment])
    ],
    providers: [EnrollmentService, EnrollmentRepository],
    exports: [EnrollmentService]
})

export class EnrollmentsModule {}