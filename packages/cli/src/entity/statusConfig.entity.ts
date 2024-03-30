// entity/photo.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class StatusConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  avatar:  string | null

  @Column({ nullable: true })
  panelVersion: string | null;

  @Column({ nullable: true })
  version: string | null;

  @Column({ nullable: true })
  verifyCode: string | null;

  @Column({ nullable: true })
  userId: string | null;
}
