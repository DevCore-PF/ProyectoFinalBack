import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MaxLength } from "class-validator";

export class ContactDto {
    @ApiProperty({example: 'Antonio Diaz'})
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;

    @ApiProperty({example: 'usuario@correo.com'})
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({example: 'Consultar sobre precios'})
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    reason: string;

    @ApiProperty({example: 'Quisiera saber si hay descuento para grupos grandes...'})
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    message: string;
}