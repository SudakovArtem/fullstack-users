import { Type } from 'class-transformer';
import { IsDefined, IsString, ValidateNested } from 'class-validator';
import { CreateProjectMemberAttributesDto } from './create-project-member-attributes.dto.js';
import { CreateProjectMemberRelationshipsDto } from './create-project-member-relationships.dto.js';

export class CreateProjectMemberResourceDto {
  @IsDefined({ message: 'data.type is required' })
  @IsString({ message: 'data.type must be a string' })
  type: string;

  @IsDefined({ message: 'data.attributes is required' })
  @ValidateNested()
  @Type(() => CreateProjectMemberAttributesDto)
  attributes: CreateProjectMemberAttributesDto;

  @IsDefined({ message: 'data.relationships is required' })
  @ValidateNested()
  @Type(() => CreateProjectMemberRelationshipsDto)
  relationships: CreateProjectMemberRelationshipsDto;
}
