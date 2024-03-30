// entity/photo.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class CodeSatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  avatar: string | null;

  @Column({ default: 'live' }) // 设置默认值为 'live'
  heartBeat: string;

  @Column({ nullable: true })
  qrError: string | null

  @Column({ nullable: true })
  qrStatus: number | null

  @Column({ nullable: true })
  qrUrl: string | null

  @Column({ nullable: true })
  robotName: string | null;

  @Column({ nullable: true })
  robotId: string | null;

  @Column({ nullable: true })
  userId: number
}
