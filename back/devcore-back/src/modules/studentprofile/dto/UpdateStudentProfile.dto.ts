import { IsArray, IsOptional, IsString, IsUrl, MaxLength } from "class-validator";

export class UpdateStudentProfileDto {
    
    @IsString()
    @IsOptional()
    @MaxLength(500, { message: 'La biografía no puede exceder los 500 caracteres' })
    biography: string;

    @IsArray()
    @IsString({ each: true })
    @IsUrl({}, { each: true, message: 'Cada enlace social debe ser una URL válida' })
    @IsOptional()
    socialLinks: string[];
}