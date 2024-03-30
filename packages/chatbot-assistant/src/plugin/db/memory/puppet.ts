import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity()
export class Puppet {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  puppetType: string
}
