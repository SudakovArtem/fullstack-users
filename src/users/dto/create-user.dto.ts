import { IsString, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsString({ message: 'Name must be a string' })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'Name must not be empty' })
  name: string;
}
