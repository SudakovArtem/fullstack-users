import { Type } from 'class-transformer';
import { IsDefined, ValidateNested } from 'class-validator';
import { UpdateUserResourceDto } from './update-user-resource.dto.js';

export class UpdateUserDocumentDto {
  @IsDefined({ message: 'data is required' })
  @ValidateNested()
  @Type(() => UpdateUserResourceDto)
  data: UpdateUserResourceDto;
}
