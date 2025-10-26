import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as UUID } from 'uuid';
import { UserRole } from '../enums/user-role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string = UUID();

  @Column({
    type: 'varchar',
    length: 30,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 60,
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 250,
    nullable: true, // AJUSTE: Debe ser true para usuarios de Google
  })
  @Exclude()
  password?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    nullable: true,
  })
  role: UserRole;

  @Column({
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  isGoogleAccount: boolean; // Bien. Para saber si se registró con Google

  @Column({
    nullable: true,
    unique: true,
  })
  @Index()
  googleId?: string; //auth0Id para google

  @Column({
    type: 'varchar',
    length: 250,
    nullable: true,
  })
  image: string;

  @Column({ default: false })
  isEmailVerified: boolean; //Se pondrá a true si es de Google

  @Column({ nullable: true })
  emailVerificationToken?: string; 

  @Column({ nullable: true })
  resetPasswordToken?: string; 

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires?: Date;

  @Column({ default: false })
  hasCompletedProfile: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  isTeacher(): boolean {
    return this.role === UserRole.TEACHER;
  }

  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  isStudent(): boolean {
    return this.role === UserRole.STUDENT;
  }
}