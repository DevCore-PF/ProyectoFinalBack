import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import Stripe from "stripe";
import { CoursesModule } from "../course/course.module";
import { Enrollment } from "../enrollments/entities/enrollment.entity";
import { EnrollmentsModule } from "../enrollments/enrollments.module";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";

const stripeProvider = {
    provide: 'STRIPE_CLIENT',
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
        const stripeSecret = configService.get<string>('STRIPE_SECRET_KEY');
        if (!stripeSecret) {
            throw new Error('STRIPE_SECRET_KEY is not set in configuration');
        }
        return new Stripe(stripeSecret, {
            apiVersion: '2025-10-29.clover',
        })
    }
}

@Module({
    imports: [
        ConfigModule,
        CoursesModule,
        EnrollmentsModule
    ],
    controllers: [PaymentsController],
    providers: [PaymentsService, stripeProvider]
})
export class PaymentsModule {}