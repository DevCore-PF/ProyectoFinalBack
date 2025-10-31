import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmpty } from 'class-validator';
import { Course } from 'src/modules/course/entities/course.entity';

@Entity('lessons')
export class Lesson {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 150 })
  title: string;

  @ApiProperty()
  @Column({ type: 'int', nullable: true })
  order?: number;

  @ApiPropertyOptional()
  @Column('simple-array')
  urlVideos: string[];

  @ApiPropertyOptional({
    type: [String],
    description: 'URLs de los documentos PDF de la lección',
  })
  @Column('simple-array', { default: '' })
  urlPdfs: string[];

  @ApiProperty()
  @Column({ default: false })
  esPreview: boolean;

  @ManyToOne(() => Course, (course) => course.lessons, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
