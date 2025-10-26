import { IsEnum, IsNotEmpty } from 'class-validator';
// Ajusta la ruta a tu enum de roles
import { UserRole } from '../../users/enums/user-role.enum'; 

export class SelectRoleDto {
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}