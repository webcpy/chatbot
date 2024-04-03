import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Room {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    roomName: string;

    @Column()
    roomId: string;

    @Column({type: 'simple-json', nullable: true})
    content: string ;

    @Column({type: 'simple-json', nullable: true})
    contact: string ;

    @Column({type: 'simple-json', nullable: true})
    wxid: string ;

    @Column()
    time: string;
}
