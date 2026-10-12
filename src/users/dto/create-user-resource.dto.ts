import { Type } from 'class-transformer';
import { IsDefined, IsString, ValidateNested } from 'class-validator';
import { CreateUserAttributesDto } from './create-user-attributes.dto.js';

export class CreateUserResourceDto {
  @IsDefined({ message: 'data.type is required' })
  @IsString({ message: 'data.type must be a string' })
  type: string;

  @IsDefined({ message: 'data.attributes is required' })
  @ValidateNested()
  @Type(() => CreateUserAttributesDto)
  attributes: CreateUserAttributesDto;
}
