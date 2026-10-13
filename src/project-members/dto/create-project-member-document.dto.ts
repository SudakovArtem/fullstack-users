import { Type } from 'class-transformer';
import { IsDefined, ValidateNested } from 'class-validator';
import { CreateProjectMemberResourceDto } from './create-project-member-resource.dto.js';

export class CreateProjectMemberDocumentDto {
  @IsDefined({ message: 'data is required' })
  @ValidateNested()
  @Type(() => CreateProjectMemberResourceDto)
  data: CreateProjectMemberResourceDto;
}
