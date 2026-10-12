import { Type } from 'class-transformer';
import { IsDefined, ValidateNested } from 'class-validator';
import { CreateUserResourceDto } from './create-user-resource.dto.js';

export class CreateUserDocumentDto {
  @IsDefined({ message: 'data is required' })
  @ValidateNested()
  @Type(() => CreateUserResourceDto)
  data: CreateUserResourceDto;
}
