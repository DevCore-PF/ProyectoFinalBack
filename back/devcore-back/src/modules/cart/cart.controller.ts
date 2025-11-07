import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CartService } from './cart.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiGetCartDoc } from './doc/getCart.doc';
import { ApiAddCourseToCartDoc } from './doc/addCoursetoCart.doc';
import { ApiClearCart } from './doc/clearCart.doc';
import { ApiRemoveCourseCart } from './doc/removeCourseCart.doc';

@UseGuards(AuthGuard('jwt'))
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  //Obtiene el carrtio actual
  @Get()
  @ApiGetCartDoc()
  async getCart(@Req() req) {
    return this.cartService.getOrCreateCart(req.user.sub);
  }

  //Añade un curso al carrito
  @Post('add')
  @ApiAddCourseToCartDoc()
  async addCourse(
    @Req() req,
    @Body('courseId', ParseUUIDPipe) courseId: string,
  ) {
    return this.cartService.addCourse(req.user.sub, courseId);
  }

  //Ruta para vaciar el carrito completo
  @Delete('clear')
  @ApiClearCart()
  async clearCart(@Req() req) {
    return this.cartService.clearCart(req.user.sub);
  }

  //Quita el curso del carrto
  @Delete('remove/:courseId')
  @ApiRemoveCourseCart()
  async removeCourse(
    @Req() req,
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ) {
    return this.cartService.removeCourse(req.user.sub, courseId);
  }
}
