import { IsBoolean, IsIn, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateCartSettingsDto {
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  isEnabled: boolean;

  @IsString()
  @IsIn(['24', '48', '72'])
  delayHours: string;
}