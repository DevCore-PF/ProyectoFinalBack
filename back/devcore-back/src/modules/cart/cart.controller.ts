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

@UseGuards(AuthGuard('jwt'))
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  //Obtiene el carrtio actual
  @Get()
  @ApiOperation({
    summary: 'Obtener el carrito del usuario',
    description:
      'Devuelve el carrito actual del usuario autenticado. Si el usuario no tiene un carrito existente, se crea uno nuevo automáticamente.',
  })
  @ApiResponse({
    status: 200,
    description: 'Carrito obtenido o creado exitosamente.',
    schema: {
      example: {
        id: 'a3b5f9c0-1234-4bcd-9876-abcdef123456',
        userId: 'c1d2e3f4-5678-9876-abcd-123456789abc',
        items: [
          {
            courseId: 'd7e8f9a0-1122-3344-5566-778899aabbcc',
            title: 'Curso de Node.js avanzado',
            price: 199.99,
          },
        ],
        total: 199.99,
        createdAt: '2025-11-03T18:20:30.000Z',
        updatedAt: '2025-11-03T18:25:10.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado. Token no válido o ausente.',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  async getCart(@Req() req) {
    return this.cartService.getOrCreateCart(req.user.sub);
  }

  //Añade un curso al carrito
  @Post('add')
  @ApiOperation({
    summary: 'Agregar un curso al carrito',
    description:
      'Permite agregar un curso al carrito del usuario autenticado. Si el usuario no tiene un carrito creado, se genera uno automáticamente antes de añadir el curso.',
  })
  @ApiResponse({
    status: 201,
    description: 'Curso agregado al carrito exitosamente',
    schema: {
      example: {
        message: 'Curso agregado al carrito',
        cartId: '123e4567-e89b-12d3-a456-426614174000',
        courseId: '456e7890-e89b-12d3-a456-426614174001',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'ID de curso inválido o curso ya existe en el carrito',
    schema: {
      example: {
        statusCode: 400,
        message: 'El curso ya está en el carrito',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Curso no encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Curso no encontrado',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  async addCourse(
    @Req() req,
    @Body('courseId', ParseUUIDPipe) courseId: string,
  ) {
    return this.cartService.addCourse(req.user.sub, courseId);
  }

  //Quita el curso del carrto
  @Delete('remove/:courseId')
  @ApiOperation({
    summary: 'Eliminar un curso del carrito',
    description:
      'Elimina un curso específico del carrito del usuario autenticado, identificado por el ID del curso. Si el curso no está en el carrito, no se realizan cambios.',
  })
  @ApiResponse({
    status: 200,
    description: 'Curso eliminado del carrito exitosamente',
    schema: {
      example: {
        message: 'Curso eliminado del carrito',
        cartId: '123e4567-e89b-12d3-a456-426614174000',
        courseId: '456e7890-e89b-12d3-a456-426614174001',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Carrito o curso no encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Curso no encontrado en el carrito',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'ID de curso inválido',
    schema: {
      example: {
        statusCode: 400,
        message: 'Validation failed (uuid is expected)',
        error: 'Bad Request',
      },
    },
  })
 

  //Ruta para vaciar el carrito completo
  @Delete('clear')
  @ApiOperation({ summary: 'Vacía todo el carrito del usuario' })
  @ApiResponse({ status: 200, description: 'Carrito vaciado con éxito' })
  async clearCart(@Req() req) {
    return this.cartService.clearCart(req.user.sub);
  }
}
