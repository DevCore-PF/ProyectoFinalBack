import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Payout } from "./entities/payout.entity";
import { PayoutController } from "./payouts.controller";
import { PayoutService } from "./payouts.service";
import { PayoutRepository } from "./payouts.repository";

// --- ¡IMPORTA LOS MÓDULOS! ---
import { MailModule } from "src/mail/mail.module";
import { EnrollmentsModule } from "../enrollments/enrollments.module";
import { ProfilesModule } from "../profiles/profiles.module";
import { AdminSettingsController } from "./admin-settings.controller";
import { CartModule } from "../cart/cart.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Payout, // <-- Solo la entidad que le pertenece a este módulo
        ]), 
        MailModule,
        EnrollmentsModule, // <-- Importa el módulo que provee EnrollmentRepository
        ProfilesModule,  // <-- Importa el módulo que provee ProfessorProfileRepository
        CartModule
    ],
    controllers: [PayoutController, AdminSettingsController],
    providers: [PayoutService, PayoutRepository]
})
export class AdminModule {}