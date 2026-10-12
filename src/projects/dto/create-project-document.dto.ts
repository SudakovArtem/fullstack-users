import { Type } from 'class-transformer';
import { IsDefined, ValidateNested } from 'class-validator';
import { CreateProjectResourceDto } from './create-project-resource.dto.js';

export class CreateProjectDocumentDto {
  @IsDefined({ message: 'data is required' })
  @ValidateNested()
  @Type(() => CreateProjectResourceDto)
  data: CreateProjectResourceDto;
}
