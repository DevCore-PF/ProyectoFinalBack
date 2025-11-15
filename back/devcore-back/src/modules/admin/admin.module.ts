import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeORMError } from "typeorm/browser";
import { Payout } from "./entities/payout.entity";
import { Enrollment } from "../enrollments/entities/enrollment.entity";
import { ProfessorProfile } from "../profiles/entities/professor-profile.entity";
import { PayoutController } from "./payouts.controller";
import { PayoutService } from "./payouts.service";
import { PayoutRepository } from "./payouts.repository";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Payout,
            Enrollment,
            ProfessorProfile
        ])
    ],
    controllers: [PayoutController],
    providers: [PayoutService,PayoutRepository]
})

export class AdminModule {}