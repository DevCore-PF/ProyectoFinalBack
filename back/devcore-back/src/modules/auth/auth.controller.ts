import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  UseGuards, // <-- 1. Importa UseGuards
  Req,        // <-- 2. Importa Req
  BadRequestException, // <-- 3. Importa BadRequestException
  Res,
  Patch,
  Query
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport'; // <-- 4. Importa AuthGuard
import { User } from '../users/entities/user.entity'; // <-- 5. Importa tu entidad User
import type { Response } from 'express';
import { SelectRoleDto } from './dto/select-role.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Ruta para el registro LOCAL (tu formulario)
   * (Recomendación: Cambia @Post() a @Post('register') para más claridad)
   */
  @Post('register') // <-- RECOMENDACIÓN
  async create(@Body() createAuthDto: CreateUserDto) {
    await this.authService.create(createAuthDto);
    const { password, confirmPassword, ...userExceptionPassword } =
      createAuthDto;

    return userExceptionPassword;
  }


  // --- RUTAS NUEVAS PARA GOOGLE ---

  /**
   * 6. RUTA DE INICIO DE GOOGLE
   * Esta es la ruta a la que tu frontend llamará (ej. un <a href="/auth/google">)
   * El AuthGuard('google') redirige automáticamente al usuario a Google.
   */
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Esta función se queda vacía. El Guard hace la redirección.
  }

  /**
   * 7. RUTA DE CALLBACK DE GOOGLE
   * Esta es la ruta a la que Google redirige al usuario DESPUÉS de un login exitoso.
   * El AuthGuard('google') intercepta la respuesta, ejecuta tu GoogleStrategy
   * y adjunta el 'user' (que retorna tu authService) a 'req.user'.
   * Ahora redirige al frontend con el token.
   */
  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Req() req,
    @Res() res: Response, // <-- 3. Inyecta la Respuesta
  ) {
    
    const user = req.user as User;

    if (!user) {
      throw new BadRequestException('Fallo en la autenticación con Google.');
    }

    // 4. Llama a tu servicio para obtener el token
    const loginData = this.authService.login(user);
    const token = loginData.access_token; // <-- 5. Extrae el token

    // 6. Construye la URL de redirección al frontend
    const redirectUrl = `${process.env.FRONTEND_URL}/auth-callback?token=${token}`;

    // 7. Redirige al usuario al frontend
    res.redirect(redirectUrl);
  }

  // --- FIN DE RUTAS DE GOOGLE ---


  @Patch('select-role')
  @UseGuards(AuthGuard('jwt')) // <-- Protegido por JWT
  async selectRole(
    @Req() req,
    @Body() selectRoleDto: SelectRoleDto,
  ) {
    // 'req.user' contiene el payload del JWT que decodificó el AuthGuard
    const userId = req.user.sub; // 'sub' es el ID del usuario
    const { role } = selectRoleDto;
    
    // El servicio actualiza al usuario y nos devuelve un nuevo token
    return this.authService.selectUserRole(userId, role);
  }

  @Get('verify-email')
  async verifyEmail(
    @Query('token') token: string,
    @Res() res: Response, // Inyectamos 'res' para redirigir
  ) {
    await this.authService.verifyEmailToken(token);
    
    // Redirige al usuario a la página de login del frontend
    res.redirect(`${process.env.FRONTEND_URL}/login?verified=true`);
  }

  @Get()
  findAll() {
    return this.authService.findAll();
  }
}