import { Type } from 'class-transformer';
import { IsDefined, IsString, ValidateNested } from 'class-validator';
import { CreateProjectAttributesDto } from './create-project-attributes.dto.js';

export class CreateProjectResourceDto {
  @IsDefined({ message: 'data.type is required' })
  @IsString({ message: 'data.type must be a string' })
  type: string;

  @IsDefined({ message: 'data.attributes is required' })
  @ValidateNested()
  @Type(() => CreateProjectAttributesDto)
  attributes: CreateProjectAttributesDto;
}
