import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmpty } from 'class-validator';

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

  @ApiProperty()
  @Column({ type: 'varchar', length: 250, nullable: false })
  urlVideo: string;

  @ApiProperty()
  @Column({ default: false })
  esPreview: boolean;

  @ApiProperty()
  @Column({ type: 'varchar', length: 250 })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
