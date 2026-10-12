import { Type } from 'class-transformer';
import { IsDefined, ValidateNested } from 'class-validator';
import { RelationshipIdentifierDto } from './relationship-identifier.dto.js';

export class CreateProjectRelationshipOwnerDto {
  @IsDefined({ message: 'relationships.owner.data is required' })
  @ValidateNested()
  @Type(() => RelationshipIdentifierDto)
  data: RelationshipIdentifierDto;
}
