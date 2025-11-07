import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { Course } from 'src/modules/course/entities/course.entity';
export enum Rating {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
}

@Entity('course_feedback')
@Unique(['user', 'course'])
export class CourseFeedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.courseFeedbacks, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Course, (course) => course.feedbacks, {
    onDelete: 'CASCADE',
  })
  course: Course;

  @Column({
    type: 'enum',
    enum: Rating,
  })
  rating: Rating;

  @Column({ type: 'text', nullable: true })
  feedback: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
