import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../enums/user-role.enum';

export class UserResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID único del usuario',
  })
  id: string;

  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre completo del usuario',
  })
  name: string;

  @ApiProperty({
    example: 'juan@example.com',
    description: 'Email del usuario',
  })
  email: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.STUDENT,
    description: 'Rol del usuario en el sistema',
    nullable: true,
  })
  role: UserRole;

  @ApiProperty({
    example: true,
    description: 'Indica si el usuario está activo',
  })
  isActive: boolean;

  @ApiProperty({
    example: true,
    description: 'Indica si aceptó los términos y condiciones',
  })
  checkBoxTerms: boolean;

  @ApiProperty({
    example: false,
    description: 'Indica si se registró con Google',
  })
  isGoogleAccount: boolean;

  @ApiProperty({
    example: false,
    description: 'Indica si se registró con GitHub',
  })
  isGitHubAccount: boolean;

  @ApiProperty({
    example: 'google-oauth2|123456789',
    description: 'ID de Google OAuth',
    required: false,
    nullable: true,
  })
  googleId?: string;

  @ApiProperty({
    example: 'github|123456789',
    description: 'ID de GitHub OAuth',
    required: false,
    nullable: true,
  })
  githubId?: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'URL de la imagen de perfil',
    nullable: true,
  })
  image: string;

  @ApiProperty({
    example: true,
    description: 'Indica si el email fue verificado',
  })
  isEmailVerified: boolean;

  @ApiProperty({
    example: false,
    description: 'Indica si completó su perfil',
  })
  hasCompletedProfile: boolean;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: 'Fecha de creación del usuario',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-20T15:45:00Z',
    description: 'Fecha de última actualización',
  })
  updatedAt: Date;
}
