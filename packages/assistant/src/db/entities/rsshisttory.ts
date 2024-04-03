import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class RssHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  lastContent: string;

  @Column({ nullable: true })
  lastTime: string;
}
