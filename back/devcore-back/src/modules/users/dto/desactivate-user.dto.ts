import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class DesactivatedUserDto {
    @IsString({message: 'El motivo debe ser un texto'})
    @IsNotEmpty({message: 'El motivo no puede estar vacio'})
    @MinLength(10, {message: 'El motivo debe tener al menos 10 caracteres'})
    reason: string;
}