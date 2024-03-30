// entity/photo.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseConfig } from './baseconfig.entity';

abstract class Common {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  robotId: string

  @Exclude()
  @Column()
  userId: string

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true})
  weixin: string | null

  @Column({ nullable: true})
  contactId: string | null

  @Column()
  wxid: string
}

@Entity()
export class Friend extends Common {
  @Column({ default: ''})
  alias: string

  @Column({ nullable: true})
  avatar: string | null

  @Column({ nullable: true})
  friend: number | null

  @Column({ nullable: true})
  gender: string | null

  @Column()
  name: string

  @Column({ nullable: true})
  signature: string | null
}

@Entity()
export class Room extends Common {
  @Column({ nullable: true})
  memberCount: number | null

  @Column({ nullable: true})
  avatar: string | null

  @Column({ nullable: true})
  uniqueId: string | null

  @Column({ nullable: true})
  roomId: string

  @Column({ nullable: true})
  topic: string | null

  @Column({ nullable: true})
  adminIds: string | null

  @Column({ nullable: true})
  name: string | null
}


@Entity()
export class RoomJoinKeywords {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => BaseConfig, it => it.roomJoinKeywords)
  base: BaseConfig;

  @Column({ nullable: true})
  reg: number | null

  @Column({ type: String})
  roomName: string

  @Column({ type: 'simple-json', nullable: true})
  keywords: string | null

  @Column({ type: 'simple-json', nullable: true})
  replys: string | null

  @Column({ type: 'simple-json', nullable: true})
  welcomes: string | null
}

@Entity()
export class BatchSend {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true})
  userId: number

  @Column({ nullable: true})
  desc: string | null

  @Column({ nullable: true})
  name: string | null

  @Column({ nullable: true})
  type: string | null

  @Column({ nullable: true})
  others: string | null

  @Column({ nullable: true})
  tags: string | null

  @Column({ nullable: true})
  target: string | null

  @Column({ type: 'simple-json', nullable: true})
  groups: string | null
}
