import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '../../users/enums/user-role.enum'; 

//dto para actualizar el rol al registrarse ya que por default llegara null
export class SelectRoleDto {
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}