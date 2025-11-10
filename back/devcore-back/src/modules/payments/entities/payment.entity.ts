import { Enrollment } from "src/modules/enrollments/entities/enrollment.entity";
import { User } from "src/modules/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({type: 'varchar', length: 255, unique:true})
    stripeId: string;

    @ManyToOne(() => User, (user) => user.payments)
    user:User;

    @Column({type: 'int'})
    amount: number;

    @Column({type: 'varchar', length: 10})
    currency: string;

    @Column({type: 'varchar', length: 50})
    status: string;

    @Column({type: 'varchar', length: 50, nullable: true})
    cardBrand: string;

    @Column({type: 'varchar', length: 4, nullable: true})
    cardLast4: string;

    @CreateDateColumn()
    createdAt: Date;

    //Relacion de un pago puedes estar asociado a varios cursos
    @OneToMany(() => Enrollment, (enrollment) => enrollment.payment)
    enrollments: Enrollment[];
}