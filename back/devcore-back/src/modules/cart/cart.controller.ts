import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { CartService } from "./cart.service";

@UseGuards(AuthGuard('jwt'))
@Controller('cart')
export class CartController {
    constructor(private readonly cartService: CartService){}

    //Obtiene el carrtio actual
    @Get()
    async getCart(@Req() req){
        return this.cartService.getOrCreateCart(req.user.sub)
    }

    //Añade un curso al carrito
    @Post('add')
    async addCourse(@Req() req, @Body('courseId', ParseUUIDPipe) courseId: string){
        return this.cartService.addCourse(req.user.sub, courseId);
    }

    //Quita el curso del carrto
    @Delete('remove/:courseId')
    async removeCourse(@Req() req, @Param('courseId', ParseUUIDPipe) courseId: string){
        return this.cartService.removeCourse(req.user.sub, courseId)
    }
}