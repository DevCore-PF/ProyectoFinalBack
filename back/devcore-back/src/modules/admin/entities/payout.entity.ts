import { ProfessorProfile } from "src/modules/profiles/entities/professor-profile.entity";
import { Column, CreateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { Enrollment } from "../../enrollments/entities/enrollment.entity";
import { PayoutStatus } from "../enums/PayoutStatus.enum";

export class Payout {
    id: string;

    @ManyToOne(() => ProfessorProfile)
    professor: ProfessorProfile;

    //este campo almacena que incripciones estan incluidas (compra de cursos)
    @OneToMany(() => Enrollment, (enrollment) => enrollment.payout)
    enrollments: Enrollment[];

    //suma de todos las ganacias del profesor
    @Column({type: 'decimal', precision: 10, scale: 2})
    totalAmount: number;

    //estatus del pago si ya se pago o esta pendiente al profesor
    @Column({type: 'enum', enum: PayoutStatus, default: PayoutStatus.PENDING})
    status: PayoutStatus;

    //referencia que subira el admin para comprobar el pago hecho al profesor de sus ganancias
    @Column({type: 'varchar', length: 255, nullable: true})
    referenceNumber: string;

    //fecha que se genero el lote
    @CreateDateColumn()
    createdAt: Date;

    //fecha en que el administrador hizo el pago de las ganacias
    @Column({type: 'timestamp', nullable: true})
    paidAt: Date;
}