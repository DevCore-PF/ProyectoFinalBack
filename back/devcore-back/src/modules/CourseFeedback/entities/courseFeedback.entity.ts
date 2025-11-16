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

  // ===== CAMPOS DE MODERACIÓN =====

  /**
   * Score de toxicidad del feedback (0.0 a 1.0)
   * 0.0 = contenido limpio
   * 1.0 = contenido extremadamente tóxico
   */
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.0 })
  toxicityScore: number;

  /**
   * Si el feedback está censurado (visible pero tapado/borroso)
   * true = mostrar censurado en el frontend
   * false = mostrar normalmente
   */
  @Column({ default: false })
  isCensored: boolean;

  /**
   * Estado de moderación del feedback
   * - approved: aprobado, mostrar normalmente
   * - pending: pendiente de revisión manual por admin
   * - censored: aprobado pero censurado (visible tapado)
   * - rejected: rechazado (no debería existir en BD, pero por si acaso)
   */
  @Column({
    type: 'enum',
    enum: ['approved', 'pending', 'censored', 'rejected'],
    default: 'approved',
  })
  moderationStatus: string;

  /**
   * Si requiere revisión manual por un admin
   */
  @Column({ default: false })
  requiresManualReview: boolean;

  /**
   * Razón de la moderación (si fue marcado)
   */
  @Column({ type: 'text', nullable: true })
  moderationReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
