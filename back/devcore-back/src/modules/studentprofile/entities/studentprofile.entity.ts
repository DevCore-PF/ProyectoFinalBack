import { User } from "src/modules/users/entities/user.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('student_profile')
export class StudentProfile {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => User, (user) => user.studentProfile)
    @JoinColumn()
    user: User;

    @Column({type: 'text', nullable: true})
    biography: string;

    @Column({type: 'simple-array', nullable: true})
    socialLinks: string[];

    @Column({type: 'varchar', nullable: true})
    city: string;

    @Column({type: 'varchar', nullable: true})
    country: string;
}