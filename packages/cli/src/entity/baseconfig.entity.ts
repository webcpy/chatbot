import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { SimpleConfig, EventConfig, RoomTaskSchedule } from './simple.entity'
import { RoomJoinKeywords } from './friendRoom.entity'
import { PrivateForwards, RoomAsyncList, CallBackEvents } from './vip.entity'
import { DayTaskSchedule, CountDownTaskSchedule, RoomNewsSchedule, CustomContent } from './schedule.entity'

@Entity()
export class BaseConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true})
  userId: number;

  @Column({ default: 'wechaty-puppet-wechat' })
  puppetType: string;

  // 机器人触发范围
  @Column({ default: 'all' })
  botScope: string;

  @Column({ default: false })
  parseMini: boolean;

  @Column({ nullable: true})
  openaiSystemMessage: string | null;

  @Column({ default: false })
  showQuestion: boolean;

  @Column({ default: 60 })
  openaiTimeout: number;

  @Column({ nullable: true})
  openaiAccessToken: string | null;

  @Column({ default: false })
  openaiDebug: boolean;

  @Column({default: 'gpt-3.5-turbo'})
  openaiModel: string;

  @Column({ nullable: true})
  dify_token: string | null;

  @Column({ nullable: true})
  dify_baseUrl: string | null;

  @Column({ nullable: true})
  proxyUrl: string | null;

  @Column({ nullable: true})
  proxyPassUrl: string | null;

  @Column({ default: false })
  chatFilter: boolean;

  @Column({ default: 1 })
  filterType: number;

  @Column({ nullable: true})
  filterAppid: string | null;

  @Column({ nullable: true})
  filterApiKey: string | null;

  @Column({ nullable: true})
  filterSecretKey: string | null;

  @OneToMany(() => CountDownTaskSchedule, (CountDownTaskSchedule) => CountDownTaskSchedule.base, {
    cascade: true, eager: true
  })
  countDownTaskSchedule: CountDownTaskSchedule[];

  @Column({ type: 'simple-json', nullable: true })
  parseMiniRooms: string | null;

  @Column({ default: 1000})
  preventLength: number;



  @Column({ nullable: true})
  preventWords: string | null;

  @Column({ default: true })
  autoAcceptFriend: boolean;

  @Column({ default: false })
  autoReply: boolean;

  @Column({ default: '0' })
  defaultBot: string;

  @Column({ type: 'simple-json', nullable: true })
  customBot: Record<string, any> | null;

  @Column({ default: 'all' })
  roomAt: string;

  @Column({ default: 0 })
  friendNoReplyInRoom: number;

  @Column({nullable: true})
  defaultReply: string | null;

  @Column({ type: 'simple-json', nullable: true })
  newFriendReplys: string | null;

  @Column({nullable: true})
  tuLingKey: string | null;

  @Column({nullable: true})
  txApiKey: string | null;

  @Column({nullable: true})
  tencentSecretId: string | null;

  @Column({nullable: true})
  tencentSecretKey: string | null;

  @Column({nullable: true})
  tencentAESKey: string | null;

  @Column({nullable: true})
  tencentToken: string | null;

  @Column({nullable: true})
  gpttoken: string | null;

  @Column({ type: 'simple-json', nullable: true })
  acceptFriendKeyWords: string | null;

  @OneToMany(() => CustomContent, (CustomContent) => CustomContent.base, {
    cascade: true, eager: true
  })
  customContent: CustomContent[]; // 请根据实际情况定义 dayTaskSchedule 的类型

  @OneToMany(() => DayTaskSchedule, (DayTaskSchedule) => DayTaskSchedule.base, {
    cascade: true, eager: true
  })
  dayTaskSchedule: DayTaskSchedule[]; // 请根据实际情况定义 dayTaskSchedule 的类型

  @OneToMany(() => RoomTaskSchedule, (RoomTaskSchedule) => RoomTaskSchedule.base, {
    cascade: true, eager: true
  })
  roomTaskSchedule: any[]; // 请根据实际情况定义 roomTaskSchedule 的类型

  @OneToMany(() => RoomNewsSchedule, (RoomNewsSchedule) => RoomNewsSchedule.base, {
    cascade: true, eager: true
  })
  roomNewsSchedule: RoomNewsSchedule[]; // 请根据实际情况定义 roomNewsSchedule 的类型

  @OneToMany(() => RoomJoinKeywords, (RoomJoinKeywords) => RoomJoinKeywords.base, {
    cascade: true, eager: true
  })
  roomJoinKeywords: RoomJoinKeywords[];

  @OneToMany(() => RoomAsyncList, (RoomAsyncList) => RoomAsyncList.base, {
    cascade: true, eager: true
  })
  roomAsyncList: string[];

  // 简单回答
  @OneToMany(() => SimpleConfig, (simpleConfig) => simpleConfig.base, {
    cascade: true, eager: true,
  })
  replyKeywords: SimpleConfig[];

  @OneToMany(() => EventConfig, (EventConfig) => EventConfig.base, {
    cascade: true, eager: true
  })
  eventKeywords: EventConfig[];

  @OneToMany(() => PrivateForwards, (PrivateForwards) => PrivateForwards.base, {
    cascade: true, eager: true
  })
  privateForwards: PrivateForwards[]; // 请根据实际情况定义 privateForwards 的类型

  @Column({ type: 'simple-json', nullable: true })
  avatarList: any[] | null;

  @OneToMany(() => CallBackEvents, (CallBackEvents) => CallBackEvents.base, {
    cascade: true, eager: true
  })
  callBackEvents: CallBackEvents[]; // 请根据实际情况定义 callBackEvents 的类型


  @Column({ type: 'simple-json', nullable: true })
  cloudRoom: any[]; // 请根据实际情况定义 cloudRoom 的类型
}
