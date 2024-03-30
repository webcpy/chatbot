import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { BaseConfig } from './baseconfig.entity';
import { Material } from './material.entity'
import { Common as Scommon } from './schedule.entity'

abstract class Common {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({nullable: true })
  scope: string;

  @Column({nullable: true })
  needAt: number;

  @Column({nullable: true })
  reg: number;

  @Column({ type: 'simple-json', nullable: true })
  keywords: string;
}

@Entity()
export class SimpleConfig extends Common {
  @ManyToOne(() => BaseConfig, it => it.replyKeywords)
  base: BaseConfig;

  @ManyToMany(() => Material, (material) => material.simple, {
    eager: true,
    cascade: true
  })
  @JoinTable()
  replys: Material[];

}

@Entity()
export class EventConfig extends Common {
  @ManyToOne(() => BaseConfig, it => it.eventKeywords)
  base: BaseConfig;

  @Column({ nullable: true })
  event: string | null;
}


@Entity()
export class RoomTaskSchedule extends Scommon  {

  @ManyToMany(() => Material, (material) => material.room, {
    eager: true,
    cascade: true
  })
  @JoinTable()
  contents: Material[];

  @ManyToOne(() => BaseConfig, it => it.roomTaskSchedule)
  base: BaseConfig;

}
