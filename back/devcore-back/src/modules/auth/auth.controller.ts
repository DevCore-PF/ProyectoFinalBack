import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  BadRequestException,
  Res,
  Patch,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../users/entities/user.entity';
import type { Response } from 'express';
import { SelectRoleDto } from './dto/select-role.dto';
import { LoginUserDto } from './dto/login-user-dto';
import { ApiConsumes, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { SocialActionGuard } from './guards/social-action.guard';
import { SetPasswordDto } from './dto/set-password.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ApiRegisterDoc } from './doc/register.doc';
import { ApiLoginDoc } from './doc/login.doc';
import { ApiGetGoogleDoc } from './doc/getGoogle.doc';
import { apiRedirectGoogleDoct } from './doc/redirectGoogle.doc';
import { ApiSlectRoleDoct } from './doc/selectRole.doc';
import { ApiVerifyEmailDoc } from './doc/verifyEmail.doc';
import { ApiRedirectGithubDoc } from './doc/getGithub.doc';
import { ApiRedirectHomeGithubDoc } from './doc/redirectGithub.doc';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Enpoint para el registro con nuestro formulario
   *
   */

  @Post('register')
  @ApiRegisterDoc()
  async create(@Body() createAuthDto: CreateUserDto) {
    return await this.authService.create(createAuthDto);
  }

  /**
   * Endpoint para login local
   */

  @Post('login')
  @ApiLoginDoc()
  @UseGuards(AuthGuard('local'))
  async login(@Req() req, @Body() loginUserDto: LoginUserDto) {
    // Si llegamos aquí, 'validate' de LocalStrategy fue exitoso
    // y Passport adjunta el 'user' a 'req.user'
    return this.authService.login(req.user);
    // Devuelve el JWT y los datos del usuario
  }

  //RUTAS PARA GOOGLE

  /**
   * RUTA DE INICIO DE GOOGLE/REGISTER
   * Esta es la ruta a la frontend llamará
   * El AuthGuard('google') redirige automáticamente al usuario a Google.
   */
  @Get('google')
  @ApiGetGoogleDoc()
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Esta función se queda vacía. El Guard hace la redirección.
  }

  /**
   * 7. RUTA DE CALLBACK DE GOOGLE
   * Esta es la ruta a la que Google redirige al usuario despues de un login exitoso. en este caso primero redirige a el rol
   * asi que como se usa dos veces el front deberia validar que si ya tiene rol lo redirija a su dashboar correspondiente
   * El AuthGuard('google') intercepta la respuesta, ejecuta tu GoogleStrategy
   * y adjunta el 'user' (que retorna authService) a 'req.user'.
   * Ahora redirige al frontend con el token.
   */
  @Get('google/redirect')
  @apiRedirectGoogleDoct()
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const user = req.user as User;

    if (!user) {
      throw new BadRequestException('Fallo en la autenticación con Google.');
    }

    // Llama a tu servicio para obtener el token
    const loginData = await this.authService.login(user);
    const token = loginData.access_token; //Extrae el token

    // Construye la URL de redirección al frontend
    //este en su caso debe ser la ruta de front donde eligiran el rol por primera vez
    const redirectUrl = `${process.env.FRONTEND_URL}/auth-callback?token=${token}`;

    //Redirige al usuario al frontend
    res.redirect(redirectUrl);
  }

  // --- FIN DE RUTAS DE GOOGLE ---

  @Patch('select-role')
  @ApiSlectRoleDoct()
  @UseGuards(AuthGuard('jwt')) // se debe pasar en las cabezeras el token generado en el registro para asignar el rol
  async selectRole(@Req() req, @Body() selectRoleDto: SelectRoleDto) {
    // 'req.user' contiene el payload del JWT que decodificó el AuthGuard
    const userId = req.user.sub; // 'sub' es el ID del usuario al que se le asiganara el rol seleccionado
    const { role } = selectRoleDto;

    // El servicio actualiza al usuario y nos devuelve un nuevo token ya con el rol asigando
    return this.authService.selectUserRole(userId, role);
  }

  @Get('verify-email')
  @ApiVerifyEmailDoc()
  async verifyEmail(
    @Query('token') token: string,
    @Res() res: Response, // Inyectamos 'res' para redirigir
  ) {
    await this.authService.verifyEmailToken(token);

    // Redirige al usuario a la página de login del frontend que se vaya usar para el login
    res.redirect(`${process.env.FRONTEND_URL}/login?verified=true`);
  }

  // @Get()
  // findAll() {
  //   return this.authService.findAll();
  // }

  @Get('github')
  @ApiRedirectGithubDoc()
  @UseGuards(AuthGuard('github'))
  async githubAuth() {}

  @Get('github/redirect')
  @ApiRedirectHomeGithubDoc()
  @UseGuards(AuthGuard('github'))
  async githubAuthRedirect(@Req() req, @Res() res: Response) {
    const user = req.user as User;
    const loginData = await this.authService.login(user);
    const token = loginData.access_token;

    const redirectUrl = `${process.env.FRONTEND_URL}/auth-callback?token=${token}`;
    res.redirect(redirectUrl);
  }

  //Nuevo Endpoint para probar el registro y login nuevo
  @Get('google/login')
  @UseGuards(SocialActionGuard('google', 'login'))
  async googleLogin() {}

  @Get('google/register')
  @UseGuards(SocialActionGuard('google', 'register'))
  async googleRegister() {}

  // 3. LOGIN CON GITHUB
  @Get('github/login')
  @UseGuards(SocialActionGuard('github', 'login'))
  async githubLogin() {}

  // 4. REGISTRO CON GITHUB
  @Get('github/register')
  @UseGuards(SocialActionGuard('github', 'register'))
  async githubRegister() {}

  /**
   * Para asignar una contraseña cuando el usuario uso github o google en el registro
   */
  @Patch('set-password')
  @UseGuards(AuthGuard('jwt')) // ¡Debe estar logueado para hacer esto!
  async setPassword(@Req() req, @Body() setPasswordDto: SetPasswordDto) {
    const userId = req.user.sub; // ID del usuario logueado
    return this.authService.setLocalPassword(userId, setPasswordDto);
  }

  /**
   * Edpoind para reenviar el mensaje de confirmacion al usuario
   */
  @Post('resend-verification')
  async resendEmail(@Body() resendDto: ResendVerificationDto) {
    return this.authService.resendVerificationEmail(resendDto);
  }
}
