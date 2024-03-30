import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class GptConfig {
  @PrimaryGeneratedColumn()
  id: number

  @Column({nullable: true})
  contactName: string 

  @Column({nullable: true})
  contactId: string 

  @Column({nullable: true})
  roomName: string 

  @Column({nullable: true})
  roomId: string 

  @Column({nullable: true})
  input: string 

  @Column({nullable: true})
  output: string 

  @Column()
  time: string
}
