import { Course } from "src/modules/course/entities/course.entity";
import { User } from "src/modules/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

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
        default: 0.0
    })
    progress: number;

    @Column({nullable: true})
    diplomaUrl: string

    @Column({type: 'timestamp', nullable: true})
    completedAt: Date;

    @CreateDateColumn()
    inscripcionDate: Date;
}