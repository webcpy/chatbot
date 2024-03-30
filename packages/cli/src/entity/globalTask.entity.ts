// entity/photo.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { CallBackEvents } from './vip.entity'
import { CustomContent } from './schedule.entity'

@Entity()
export class GlobalTask  {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  userId: number

  @Column()
  label: string

  @Column()
  customUrl: string

  @Column()
  methods: string

  @Column({ type: 'simple-json', nullable: true})
  moreData: string

  @OneToMany(() => CallBackEvents, (CallBackEvents) => CallBackEvents.api)
  callbackEvent: CallBackEvents[];

  @OneToMany(() => CustomContent, (CustomContent) => CustomContent.api)
  customContent: CustomContent[];


}
