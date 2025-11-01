import { Course } from "src/modules/course/entities/course.entity";
import { User } from "src/modules/users/entities/user.entity";
import { Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('carts')
export class Cart {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => User, (user) => user.cart)
    @JoinColumn()
    user: User;

    @ManyToMany(() => Course)
    @JoinTable({
        name: 'cart_courses',
        joinColumn: {name: 'cart_id', referencedColumnName: 'id'},
        inverseJoinColumn: {name: 'course_id', referencedColumnName: 'id'}
    })
    courses: Course[];
}