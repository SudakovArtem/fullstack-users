import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { IsNotBlank } from '../../common/decorators/is-not-blank.decorator.js';

export class UpdateUserAttributesDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @ValidateIf((_, value) => value !== undefined)
  @IsString({ message: 'Name must be a string' })
  @IsNotBlank({ message: 'Name should not be blank' })
  @IsNotEmpty({ message: 'Name must not be empty' })
  name?: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email?: string | null;
}
