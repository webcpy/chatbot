// entity/photo.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, UpdateDateColumn } from 'typeorm';
import { BaseConfig } from './baseconfig.entity';
import { GlobalTask } from './globalTask.entity'

export abstract class Common {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ nullable: true })
  alias: string | null

  @Column({type: 'simple-json', nullable: true})
  cronDate: string | null

  @Column({default: '', nullable: true})
  date: string

  @Column({default: '', nullable: true})
  endWord: string

  @Column({default: '', nullable: true})
  memorialDay: string

  @Column({ type: 'simple-json', nullable: true })
  names: string | null

  @Column({default: "contact", nullable: true})
  type: string
}

@Entity()
export class DayTaskSchedule extends Common  {

  @ManyToOne(() => BaseConfig, it => it.dayTaskSchedule)
  base: BaseConfig;

  @Column({default: ''})
  city: string

}

@Entity()
export class CountDownTaskSchedule extends Common  {


  @ManyToOne(() => BaseConfig, it => it.countDownTaskSchedule)
  base: BaseConfig;

  @Column({default: '', type: String})
  prefix: string

  @Column({default: ''})
  suffix: string

}

@Entity()
export class RoomNewsSchedule extends Common  {

  @ManyToOne(() => BaseConfig, it => it.roomNewsSchedule)
  base: BaseConfig;

  @Column()
  sortId: number
}


@Entity()
export class CustomContent  {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => BaseConfig, it => it.customContent)
  base: BaseConfig;

  @Column({default: "contact"})
  type: string

  @Column({type: 'simple-json', nullable: true})
  names: string

  @Column({default: 'customApi', nullable: true})
  taskType: string | null

  @Column({nullable: true})
  cron: string


  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => GlobalTask, it => it.customContent, {
    eager: true
  })
  api: GlobalTask;
}

