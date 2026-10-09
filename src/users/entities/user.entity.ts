import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('identity', { generatedIdentity: 'ALWAYS' })
  id: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true, unique: true })
  email: string | null;
}
