import { IsArray, IsNotEmpty, IsUUID } from "class-validator";

export class CreateCheckoutDto {

    @IsArray()
    @IsNotEmpty()
    @IsUUID('4', {each: true, message: 'Cada ID de curso debe ser valido'})
    courseIds: string[];
}