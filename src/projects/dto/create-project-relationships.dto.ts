import { Type } from 'class-transformer';
import { IsDefined, ValidateNested } from 'class-validator';
import { CreateProjectRelationshipOwnerDto } from './create-project-relationship-owner.dto.js';

export class CreateProjectRelationshipsDto {
  @IsDefined({ message: 'relationships.owner is required' })
  @ValidateNested()
  @Type(() => CreateProjectRelationshipOwnerDto)
  owner: CreateProjectRelationshipOwnerDto;
}
