import { IsString, Matches } from 'class-validator';

export class RelationshipIdentifierDto {
  @IsString({ message: 'type must be a string' })
  type!: string;

  @IsString({ message: 'id must be a string' })
  @Matches(/^[1-9]\d*$/, {
    message: 'id must be a positive integer string',
  })
  id: string;
}
