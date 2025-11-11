import { Course } from 'src/modules/course/entities/course.entity';
import { Payment } from 'src/modules/payments/entities/payment.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('enrollment')
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.enrollments)
  user: User;

  @ManyToOne(() => Course, (course) => course.enrollments)
  course: Course;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0.0,
  })
  progress: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0.0,
  })
  priceAtPurchase: number;

  @Column({ nullable: true })
  diplomaUrl: string;

  @Column({ type: 'boolean', default: false })
  completed: boolean;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  inscripcionDate: Date;

  //relacion hacia los datos del pago del curso
  @ManyToOne(() => Payment, (payment) => payment.enrollments, {nullable:false})
  payment: Payment
}
