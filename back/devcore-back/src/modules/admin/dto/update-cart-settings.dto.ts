import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateCartSettingsDto {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  isEnabled: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['24', '48', '72'])
  delayHours: string;
}