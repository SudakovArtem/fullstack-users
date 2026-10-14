import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { IsNotBlank } from '../../common/decorators/is-not-blank.decorator.js';

export class RegisterDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Name must be a string' })
  @IsNotBlank({ message: 'Name should not be blank' })
  name: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}
