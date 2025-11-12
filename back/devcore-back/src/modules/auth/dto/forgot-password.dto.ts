import { IsEmail, IsNotEmpty } from "class-validator";

export class ForgotPasswordDto {
    @IsEmail({}, {message: 'Debe ser un correo electrónico válido'})
    @IsNotEmpty({message: 'El corre electronico no puede estar vacio'})
    email: string;
}