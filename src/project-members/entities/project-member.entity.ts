import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity.js';
import { ProjectEntity } from '../../projects/entities/project.entity.js';

export type ProjectMemberRole = 'admin' | 'member' | 'viewer';

@Entity('project_members')
export class ProjectMemberEntity {
  @PrimaryColumn({ name: 'project_id', type: 'integer' })
  projectId: number;

  @PrimaryColumn({ name: 'user_id', type: 'integer' })
  userId: number;

  @Column({ type: 'text', default: 'member' })
  role: ProjectMemberRole;

  @Column({
    name: 'joined_at',
    type: 'timestamptz',
    default: () => 'now()',
  })
  joinedAt: Date;

  @ManyToOne(() => ProjectEntity, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'project_id' })
  project: ProjectEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
