import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  Unique,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { Lesson } from 'src/modules/lesson/entities/lesson.entity';

@Entity('lesson_progress')
@Unique(['user', 'lesson'])
export class LessonProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user: User) => user.lessonProgress, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Lesson, (lesson: Lesson) => lesson.progress, {
    onDelete: 'CASCADE',
  })
  lesson: Lesson;

  @Column({ default: false })
  completed: boolean;

  @CreateDateColumn({ nullable: true })
  completedAt: Date | null;
}
