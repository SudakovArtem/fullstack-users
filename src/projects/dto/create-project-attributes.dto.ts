import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsNotBlank } from '../../common/decorators/is-not-blank.decorator.js';

export class CreateProjectAttributesDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Name must be a string' })
  @IsNotBlank({ message: 'Name should not be blank' })
  @IsNotEmpty({ message: 'Name must not be empty' })
  name: string;
}
