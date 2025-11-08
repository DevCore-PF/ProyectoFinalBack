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
  UseFilters,
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
import { OauthExceptionFilter } from './filters/oauth-exception.filter';

@Controller('auth')
@UseFilters(new OauthExceptionFilter())
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Enpoint para el registro con nuestro formulario
   *
   */
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('register')
  @ApiOperation({
    summary: 'Registrar un nuevo usuario',
    description:
      'Crea una nueva cuenta de usuario en el sistema. Requiere datos básicos como nombre, correo electrónico y contraseña. Devuelve la información del usuario registrado o un token de autenticación si el registro es exitoso.',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Juan Pérez',
        email: 'juan@example.com',
        role: 'student',
        isActive: true,
        isEmailVerified: false,
        hasCompletedProfile: false,
        createdAt: '2024-01-15T10:30:00Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o email ya registrado',
    schema: {
      example: {
        statusCode: 400,
        message: ['El email debe ser un email', 'La contraseña es muy debil'],
        error: 'Bad Request',
      },
    },
  })
  async create(@Body() createAuthDto: CreateUserDto) {
    return await this.authService.create(createAuthDto);
  }

  /**
   * Endpoint para login local
   */
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('login')
  @ApiOperation({
    summary: 'Iniciar sesión de usuario',
    description:
      'Permite a un usuario autenticarse en el sistema mediante su correo electrónico y contraseña. Devuelve un token de acceso (JWT) que debe utilizarse para acceder a los endpoints protegidos.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Juan Pérez',
          email: 'juan@example.com',
          role: 'student',
          image: 'https://example.com/avatar.jpg',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas',
    schema: {
      example: {
        statusCode: 401,
        message: 'Email o contraseña incorrectos',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
    schema: {
      example: {
        statusCode: 400,
        message: ['El email debe ser un email', 'Password no debe estar vacio'],
        error: 'Bad Request',
      },
    },
  })
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
  @ApiOperation({
    summary: 'Redirigir al inicio de sesión con Google',
    description:
      'Inicia el proceso de autenticación con Google. Redirige al usuario al servicio de Google para autorizar el acceso y continuar con el inicio de sesión mediante OAuth2.',
  })
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
  @ApiOperation({
    summary: 'Redirección después del inicio de sesión con Google',
    description:
      'Endpoint de callback utilizado por Google tras la autenticación exitosa. Procesa la información del usuario proporcionada por Google y genera el token de acceso (JWT) correspondiente para iniciar sesión en el sistema.',
  })
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

  @ApiConsumes('application/x-www-form-urlencoded')
  @Patch('select-role')
  @ApiOperation({
    summary: 'Seleccionar el rol de un usuario',
    description:
      'Permite asignar o actualizar el rol de un usuario autenticado (por ejemplo, estudiante o profesor). Este endpoint se utiliza generalmente después del registro o durante la configuración inicial del perfil.',
  })
  @UseGuards(AuthGuard('jwt')) // se debe pasar en las cabezeras el token generado en el registro para asignar el rol
  async selectRole(@Req() req, @Body() selectRoleDto: SelectRoleDto) {
    // 'req.user' contiene el payload del JWT que decodificó el AuthGuard
    const userId = req.user.sub; // 'sub' es el ID del usuario al que se le asiganara el rol seleccionado
    const { role } = selectRoleDto;

    // El servicio actualiza al usuario y nos devuelve un nuevo token ya con el rol asigando
    return this.authService.selectUserRole(userId, role);
  }

  @Get('verify-email')
  @ApiOperation({
    summary: 'Verificar correo electrónico del usuario',
    description:
      'Verifica la dirección de correo electrónico de un usuario mediante un token enviado por email. Este endpoint completa el proceso de validación de cuenta para permitir el acceso al sistema.',
  })
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
  @ApiOperation({
    summary: 'Redirigir al inicio de sesión con GitHub',
    description:
      'Inicia el proceso de autenticación con GitHub. Redirige al usuario al servicio de GitHub para autorizar el acceso y continuar con el inicio de sesión mediante OAuth2.',
  })
  @UseGuards(AuthGuard('github'))
  async githubAuth() {}

  @Get('github/redirect')
  @ApiOperation({
    summary: 'Redirección después del inicio de sesión con GitHub',
    description:
      'Endpoint de callback utilizado por GitHub tras una autenticación exitosa. Procesa la información del usuario proporcionada por GitHub y genera el token de acceso (JWT) correspondiente para iniciar sesión en el sistema.',
  })
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
  async googleRegister(){}

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
  async resendEmail(@Body() resendDto: ResendVerificationDto){
    return this.authService.resendVerificationEmail(resendDto)
  }


}
