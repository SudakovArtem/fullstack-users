import { Type } from 'class-transformer';
import { IsDefined, ValidateNested } from 'class-validator';
import { UpdateProjectMemberResourceDto } from './update-project-member-resource.dto.js';

export class UpdateProjectMemberDocumentDto {
  @IsDefined({ message: 'data is required' })
  @ValidateNested()
  @Type(() => UpdateProjectMemberResourceDto)
  data: UpdateProjectMemberResourceDto;
}
