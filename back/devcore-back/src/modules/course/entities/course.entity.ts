import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Lesson } from 'src/modules/lesson/entities/lesson.entity';
import { ProfessorProfile } from 'src/modules/profiles/entities/professor-profile.entity';
import { Enrollment } from 'src/modules/enrollments/entities/enrollment.entity';

export enum CourseStatus {
  DRAFT = 'BORRADOR',
  PUBLISHED = 'PUBLICADO',
}

export enum CourseDifficulty {
  BEGINNER = 'PRINCIPIANTE',
  INTERMEDIATE = 'INTERMEDIO',
  ADVANCED = 'AVANZADO',
}

@Entity('courses')
export class Course {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Introducción a TypeScript' })
  @Column({ type: 'varchar', length: 100 })
  title: string;

  @ApiProperty({
    example:
      'Aprendé los fundamentos de TypeScript y cómo aplicarlo con Node.js.',
  })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({
    example: 'https://res.cloudinary.com/.../curso-imagen.png',
    description: 'URL de la imagen del curso (obligatoria)',
  })
  @Column('text', { array: true })
  images: string[];

  @ApiProperty({ example: 49.99 })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price: number;

  @ApiProperty({ enum: CourseStatus, example: CourseStatus.DRAFT })
  @Column({
    type: 'enum',
    enum: CourseStatus,
    default: CourseStatus.DRAFT,
  })
  status: CourseStatus;

  @ApiProperty({ example: '4h 30m', description: 'Duración total del curso' })
  @Column({ type: 'varchar', length: 50, nullable: false })
  duration: string;

  @ApiProperty({
    enum: CourseDifficulty,
    example: CourseDifficulty.BEGINNER,
    description: 'Nivel de dificultad del curso (obligatorio)',
  })
  @Column({
    type: 'enum',
    enum: CourseDifficulty,
    nullable: false,
  })
  difficulty: CourseDifficulty;

  @OneToMany(() => Lesson, (lesson) => lesson.course, {
    cascade: true,
  })
  lessons: Lesson[];

  @ManyToOne(() => ProfessorProfile, (professor) => professor.courses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'professor_id' })
  professor: ProfessorProfile;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.course)
  enrollments: Enrollment[];

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
