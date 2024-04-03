import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class RssData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  contactName: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  contactId: string;

  @Column({ nullable: true })
  roomName: string;

  @Column({ nullable: true })
  roomId: string;

  @Column()
  input: string;

  @Column()
  output: string;

  @Column()
  time: string;
}
