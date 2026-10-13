import { Type } from 'class-transformer';
import { IsDefined, IsString, Matches, ValidateNested } from 'class-validator';
import { UpdateProjectMemberAttributesDto } from './update-project-member-attributes.dto.js';

const COMPOSITE_ID = /^[1-9]\d*:[1-9]\d*$/;

export class UpdateProjectMemberResourceDto {
  @IsDefined({ message: 'data.type is required' })
  @IsString({ message: 'data.type must be a string' })
  type: string;

  @IsDefined({ message: 'data.id is required' })
  @IsString({ message: 'data.id must be a string' })
  @Matches(COMPOSITE_ID, {
    message: 'id must be in "{projectId}:{userId}" format',
  })
  id: string;

  @IsDefined({ message: 'data.attributes is required' })
  @ValidateNested()
  @Type(() => UpdateProjectMemberAttributesDto)
  attributes: UpdateProjectMemberAttributesDto;
}
