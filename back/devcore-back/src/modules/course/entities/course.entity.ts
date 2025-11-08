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
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Lesson } from 'src/modules/lesson/entities/lesson.entity';
import { ProfessorProfile } from 'src/modules/profiles/entities/professor-profile.entity';
import { Enrollment } from 'src/modules/enrollments/entities/enrollment.entity';
import { CourseFeedback } from 'src/modules/CourseFeedback/entities/courseFeedback.entity';

export enum CourseStatus {
  DRAFT = 'EN REVISION',
  PUBLISHED = 'PUBLICADO',
}

export enum CourseDifficulty {
  BEGINNER = 'PRINCIPIANTE',
  INTERMEDIATE = 'INTERMEDIO',
  ADVANCED = 'AVANZADO',
}

export enum Category {
  FrontEnd = 'Front End',
  Backend = 'Backend',
  DataScience = 'Data Science',
  Database = 'Database',
  VideoGames = 'Video Games',
  MobileDevelopment = 'Mobile Development',
}

export enum Tipo {
  Curse = 'Curso',
  Carrer = 'Carrera',
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

  @ApiProperty({ example: 49.99 })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price: number;

  @ApiProperty({ enum: CourseStatus, example: CourseStatus.DRAFT })
  @Column({
    type: 'enum',
    enum: CourseStatus,
    default: CourseStatus.PUBLISHED,
  })
  status: CourseStatus;

  @ApiProperty({ example: '4h 30m', description: 'Duración total del curso' })
  @Column({ type: 'varchar', length: 50, nullable: false })
  duration: string;

  @Column({
    type: 'enum',
    enum: Category,
  })
  category: Category;

  @Column({
    type: 'enum',
    enum: Tipo,
  })
  type: Tipo;

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
  @Column({ type: 'enum', enum: CourseDifficulty })
  difficulty: CourseDifficulty;

  // @Column({ type: 'decimal', nullable: true })
  // @Min(1, { message: 'El rating no puede ser menor que 1.' })
  // @Max(10, { message: 'El rating no puede ser mayor que 5.' })
  // Rating: number;

  // @Column({ type: 'varchar', length: 250, nullable: true })
  // Feedback: string;

  @Column({
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @OneToMany(() => Lesson, (lesson) => lesson.course, {
    cascade: true,
  })
  lessons: Lesson[];

  @OneToMany(() => CourseFeedback, (feedback) => feedback.course)
  feedbacks: CourseFeedback[];

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
