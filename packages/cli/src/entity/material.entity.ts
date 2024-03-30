// entity/photo.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany, JoinTable
} from 'typeorm';
import { SimpleConfig, RoomTaskSchedule } from './simple.entity'
// import { TextConfig } from './schedule.entity'

@Entity()
export class Material {
  @PrimaryGeneratedColumn()
  materialId: number;
  // 素材别名
  @Column()
  name: string;

  @ManyToMany(() => RoomTaskSchedule,  (RoomTaskSchedule) => RoomTaskSchedule.contents)
  @JoinTable()
  room: RoomTaskSchedule[];

  @ManyToMany(() => SimpleConfig,  (SimpleConfig) => SimpleConfig.replys)
  @JoinTable()
  simple: SimpleConfig[];

  // @ManyToMany(() => TextConfig,  (TextConfig) => TextConfig.replys)
  // @JoinTable()
  // text: SimpleConfig[];


  // 素材标签
  @Column({ nullable: true })
  tag: string | null;

  @Column({ nullable: true })
  description: string | null;

  // 图片
  @Column({ nullable: true })
  thumbUrl: string | null;

  @Column({ nullable: true })
  title: string | null;

  @Column()
  type: number;

  @Column({ nullable: true })
  url: string | null;

  @Column({ nullable: true })
  content: string | null;

  @Column({ nullable: true })
  appid: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 分享地址
  @Column({ nullable: true })
  pagePath: string | null;

  @Column({ nullable: true })
  imageUrl: string | null;

  @Column({ nullable: true })
  username: string | null;

  @Column({ nullable: true })
  fileType: string | null;

  @Column({ nullable: true })
  sourceUrl: string | null;

  @Column({ nullable: true })
  status: string | null;

  @Column({ nullable: true })
  suggestions: string | null;

  @Column({ nullable: true })
  summary: string | null;

  @Column()
  userId: number;
}
