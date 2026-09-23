import { IsString, IsNotEmpty } from 'class-validator';
import { IsNotBlank } from '../../common/decorators/is-not-blank.decorator.js';

export class CreateUserDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotBlank({ message: 'Name should not be blank' })
  @IsNotEmpty({ message: 'Name must not be empty' })
  name: string;
}
