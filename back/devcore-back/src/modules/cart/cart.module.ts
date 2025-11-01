import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Cart } from "./entities/cart.entity";
import { CoursesModule } from "../course/course.module";
import { CartRepository } from "./cart.repository";
import { CartService } from "./cart.service";
import { CartController } from "./cart.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([Cart]),
        CoursesModule
    ],
    providers: [CartService, CartRepository],
    controllers: [CartController],
    exports: [CartRepository, CartService]
})

export class CartModule {}