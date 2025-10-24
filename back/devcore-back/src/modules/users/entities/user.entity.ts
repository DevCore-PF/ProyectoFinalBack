import { Exclude } from 'class-transformer';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as UUID } from 'uuid';
import { UserRole } from '../enums/user-role.enum';
import * as bcrypt from 'bcrypt';

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
    nullable: false,
  })
  @Exclude()
  password: string;

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
  isGoogleAccount: boolean;

  @Column({
    nullable: true,
    unique: true,
  })
  @Index()
  auth0Id?: string;

  @Column({
    type: 'varchar',
    length: 250,
    nullable: true,
  })
  image: string;

  @Column({ default: false })
  isEmailVerified: boolean; // true automáticamente si es Auth0

  @Column({ nullable: true })
  emailVerificationToken?: string; // Solo se usara para elr registro local y el usuario confirme su email
  //asi evitamos que se registren con correos falsos

  @Column({ nullable: true })
  resetPasswordToken?: string; // Soloa para usuarios de nuestro registro para recuperar su contraseña

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
