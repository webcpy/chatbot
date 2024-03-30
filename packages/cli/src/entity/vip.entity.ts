// entity/photo.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseConfig } from './baseconfig.entity';
import { GlobalTask } from './globalTask.entity'

@Entity()
export class PrivateForwards  {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => BaseConfig, it => it.privateForwards)
  base: BaseConfig;

  @Column({ nullable: true})
  userId: number | null

  @Column({type: 'simple-json', default: ''})
  names: string | null

  @Column({ type:'simple-json', nullable: true})
  contacts: number | null

  @Column({ type:'simple-json', nullable: true})
  rooms: string | null

  @Column({ nullable: true})
  type: number

}

@Entity()
export class RoomAsyncList  {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => BaseConfig, it => it.roomAsyncList)
  base: BaseConfig;

  @Column({type:'simple-json', nullable: true})
  ones: string

  @Column({ default: 1 })
  model: number

  @Column({type:'simple-json', nullable: true})
  manys: string | null

  @Column({ default: 1 })
  forward: number

}

@Entity()
export class CallBackEvents  {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => BaseConfig, it => it.callBackEvents)
  base: BaseConfig;

  // @Column({ nullable: true })
  // apiId: number

  // @Column({ nullable: true })
  // apiLabel: string

  @ManyToOne(() => GlobalTask, it => it.callbackEvent, {
    eager: true
  })
  api: GlobalTask;

  // @Column({default: ''})
  // customUrl: string

  @Column({ default: 1 })
  needAt: number

  @Column({ type:'simple-json', nullable: true})
  keywords: string | null

  // @Column({ type:'text', nullable: true})
  // moreData: string | null

  @Column({ default: "friend" })
  reg: number

  @Column({ default: 1 })
  scope: string

  @Column({ default: 100 })
  type: number

  @Column({ default: 10 })
  timeout: number

}
