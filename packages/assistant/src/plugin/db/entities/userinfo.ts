import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({database: 'chatbox'})
export class UserInfo {
    @PrimaryColumn({ type: 'varchar', length: 255 })
    id: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    address: string;

    @Column({ type: 'varchar', length: 255, default: '' })
    alias: string;

    @Column({ type: 'varchar', length: 255 })
    avatar: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    city: string;

    @Column({ type: 'boolean', default: false })
    friend: boolean;

    @Column({ type: 'int' })
    gender: number;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'simple-array', nullable: true })
    phone: string[];

    @Column({ type: 'varchar', length: 255, nullable: true })
    province: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    signature: string;

    @Column({ type: 'boolean', default: false })
    star: boolean;

    @Column({ type: 'varchar', length: 255, nullable: true })
    weixin: string;

    @Column({ type: 'int' })
    type: number;

    @Column({ type: 'varchar', length: 255 })
    robotId: string;
}
