import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeORMError } from "typeorm/browser";
import { Payout } from "./entities/payout.entity";
import { Enrollment } from "../enrollments/entities/enrollment.entity";
import { ProfessorProfile } from "../profiles/entities/professor-profile.entity";
import { PayoutController } from "./payouts.controller";
import { PayoutService } from "./payouts.service";
import { PayoutRepository } from "./payouts.repository";
import { EnrollmentRepository } from "../enrollments/enrollments.repository";
import { MailModule } from "src/mail/mail.module";
import { MailService } from "src/mail/mail.service";
import { EnrollmentsModule } from "../enrollments/enrollments.module";
import { ProfilesModule } from "../profiles/profiles.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Payout,
            Enrollment,
            ProfessorProfile,
            
        ]), MailModule, EnrollmentsModule, ProfilesModule
    ],
    controllers: [PayoutController],
    providers: [PayoutService,PayoutRepository]
})

export class AdminModule {}