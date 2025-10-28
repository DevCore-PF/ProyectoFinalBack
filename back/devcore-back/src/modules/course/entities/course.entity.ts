import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

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
  @Column({
    type: 'varchar',
    length: 250,
    nullable: false,
  })
  image: string;

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

  @ApiProperty({
    type: [String],
    description: 'Lista de lecciones incluidas en el curso.',
    example: ['Lección 1: Introducción', 'Lección 2: Fundamentos'],
  })
  @Column('simple-array')
  @IsArray()
  @IsString({ each: true })
  lessons: string[];

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
