import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class RejectRequestDto {
    @ApiProperty({
        example: 'Los certificados presentador no son legibles o validos',
        description: 'Motivo obligatorio por el cual se rechaza la solicitud',
        minLength: 15
    })
    @IsString({message: 'El motivo debe ser un texto'})
    @IsNotEmpty({message: 'El motivo no puede estar vacio'})
    @MinLength(15, {message: 'El motivo debe tener al menos 15 caracteres'})
    reason: string
}