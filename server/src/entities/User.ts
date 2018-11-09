import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { UserRating } from './UserRating';

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 100
    })
    name: string;

    @Column({
        length: 100
    })
    surname: string;

    @Column({
        length: 100
    })
    email: string;

    @Column()
    password: string;

    @Column({ default: false })
    admin: boolean;

    @OneToMany(type => UserRating, rating => rating.user, {
        cascade: true
    })
    ratings: UserRating[];
}
