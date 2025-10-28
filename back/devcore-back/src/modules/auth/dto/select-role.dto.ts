import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '../../users/enums/user-role.enum';
import { ApiProperty } from '@nestjs/swagger';

//dto para actualizar el rol al registrarse ya que por default llegara null
export class SelectRoleDto {
  @ApiProperty({
    description: 'Rol que se asignará al usuario',
    enum: UserRole,
    example: UserRole.STUDENT,
  })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}
