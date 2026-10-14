import { Transform } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  password: string;
}
