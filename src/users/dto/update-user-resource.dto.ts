import { Type } from 'class-transformer';
import { IsDefined, IsString, ValidateNested } from 'class-validator';
import { UpdateUserAttributesDto } from './update-user-attributes.dto.js';

export class UpdateUserResourceDto {
  @IsDefined({ message: 'data.type is required' })
  @IsString({ message: 'data.type must be a string' })
  type: string;

  @IsDefined({ message: 'data.id is required' })
  @IsString({ message: 'data.id must be a string' })
  id: string;

  @IsDefined({ message: 'data.attributes is required' })
  @ValidateNested()
  @Type(() => UpdateUserAttributesDto)
  attributes: UpdateUserAttributesDto;
}
