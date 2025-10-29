import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { ApprovalStatus } from "../enums/approval-status.enum";

@Entity('professor_profiles')
export class ProfessorProfile {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => User, (user) => user.professorProfile)
    @JoinColumn()
    user: User;

    @Column({type: 'varchar', length: 20, nullable: true})
    phone: string;

    @Column({type: 'varchar', length: 100, nullable: true})
    profession:string;

    @Column({type: 'varchar', length: 100, nullable: true})
    speciality: string;

    @Column({type: 'text', nullable: true})
    biography: string;

    @Column({type: 'simple-array', nullable: true})
    certificates: string[];

    @Column({type: 'simple-array', nullable: true})
    professionalLinks: string[];

    @Column({type: 'boolean', default: false})
    agreedToTerms: boolean;

    @Column({type: 'boolean', default:false})
    agreedToInfo: boolean;

    @Column({type: 'boolean', default: false})
    agreedToAproveed: boolean;

    @Column({type: 'enum', enum: ApprovalStatus, default: ApprovalStatus.PENDING})
    approvalStatus: ApprovalStatus;

    createdAt: Date;

    updatedAt: Date;
}