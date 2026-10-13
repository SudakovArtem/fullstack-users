import { Type } from 'class-transformer';
import { IsDefined, ValidateNested } from 'class-validator';
import { RelationshipIdentifierDto } from '../../common/json-api/dto/relationship-identifier.dto.js';

class UserRelationshipDto {
  @IsDefined({ message: 'relationships.user.data is required' })
  @ValidateNested()
  @Type(() => RelationshipIdentifierDto)
  data: RelationshipIdentifierDto;
}

export class CreateProjectMemberRelationshipsDto {
  @IsDefined({ message: 'relationships.user is required' })
  @ValidateNested()
  @Type(() => UserRelationshipDto)
  user: UserRelationshipDto;
}
