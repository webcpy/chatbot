// entity/photo.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class File {
  @PrimaryGeneratedColumn()
  fileId: number;

  @Column()
  hash: string;

  @Column()
  key: string;
}
