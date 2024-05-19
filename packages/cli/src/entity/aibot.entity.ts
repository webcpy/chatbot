// entity/photo.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn, CreateDateColumn, OneToMany, ManyToOne } from 'typeorm';

@Entity()
export class AiBotPromot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable: true})
  desc: string | null;

  @Column()
  name: string;

  @Column()
  userId: number;

  @Column()
  promot: string;

  @Column()
  tag: string;

  @Column({default: false})
  isAiMba: Boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => AiBotCustomchat, (it) => it.promotId)
  aibot: AiBotCustomchat[]
}

@Entity()
export class AiBotCustomchat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  openChat: Boolean;

  @Column()
  userId: number;

  @Column({default: 'contact'})
  type: string;

  @Column({type: 'simple-json', nullable: true})
  targets: string | null;

  @Column({type: 'simple-json', nullable: true})
  keywords: string | null;

  @Column({ default: 1})
  needAt: number;

  @Column({ default: 0})
  limitNum: number;

  @Column({ default: 0})
  limitWord: number;

  @Column({ nullable: true })
  defaultReply: string | null;

  @Column({ nullable: true })
  rechargeTip: string | null;

  @Column({ default: '6' })
  robotType: string;

  @Column({ default: false})
  filter: Boolean;

  @Column({ default: '1' })
  filterType: string;

  @Column({ nullable: true })
  filterAppid: string | null;

  @Column({ nullable: true })
  filterApiKey: string | null;

  @Column({ nullable: true })
  filterSecretKey: string | null;

  @Column({ default: 60})
  timeoutMs: number;

  @ManyToOne(() => AiBotPromot, (it) => it.aibot, { cascade: true, eager: true})
  promotId: AiBotPromot;

  @Column({ default: false})
  showQuestion: Boolean;

  @Column({ default: false})
  tts: Boolean;

  @Column({ default: false})
  openWhisper: Boolean;



  @Column({ nullable: true })
  voice: string;

  @Column({ default: false})
  open4v: Boolean;

  @Column({ default: false})
  debug: Boolean;

  @Column({ default: false})
  isAiAgent: Boolean;

  @Column({ default: false})
  showDownloadUrl: Boolean;

  @Column({ default: 'gpt-3.5-turbo' })
  model: string ;

  @Column({ nullable: true })
  token: string | null;

  @Column({ nullable: true })
  proxyUrl: string | null;

  @Column({type: 'simple-json', nullable: true})
  keywordSystemMessages: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
