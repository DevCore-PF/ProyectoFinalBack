import { Course } from "src/modules/course/entities/course.entity";
import { User } from "src/modules/users/entities/user.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('carts')
export class Cart {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => User, (user) => user.cart)
    @JoinColumn()
    user: User;

    //resgitra automaticamente la ultima vez que el carrito fue modificado
    @UpdateDateColumn()
    updatedAt: Date;

    @Column({type: 'boolean',default:false})
    notificationSent: boolean;

    //esto evita spam para el usuario
    @ManyToMany(() => Course)
    @JoinTable({
        name: 'cart_courses',
        joinColumn: {name: 'cart_id', referencedColumnName: 'id'},
        inverseJoinColumn: {name: 'course_id', referencedColumnName: 'id'}
    })
    courses: Course[];
}