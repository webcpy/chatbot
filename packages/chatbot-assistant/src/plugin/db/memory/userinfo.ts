import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({name: 'UserInfo'})
export class UserInfo {
  @PrimaryGeneratedColumn()
  wechatId: number;

  @Column()
  id: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  star: string;

  @Column({ nullable: true })
  alias: string;

  @Column()
  avatar: string;

  @Column({ nullable: true })
  city: string;

  @Column({nullable: true})
  friend: boolean;

  @Column({nullable: true})
  gender: number;

  @Column()
  name: string;

  @Column('simple-array', { nullable: true })
  phone: string[];

  @Column({ nullable: true })
  province: string;

  @Column({ nullable: true })
  signature: string;

  @Column({ nullable: true })
  weixin: string;

  @Column({ nullable: true })
  userId: string;

  @Column({default:1})
  type: number;

  @Column({nullable: true})
  robotId: string;
}
