import { InjectRepository } from '@nestjs/typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { DeepPartial, Repository, IsNull } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EnrollmentRepository {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
  ) {}

  /**
   * Creamos una instancia sin guardar de enrollment
   */
  create(enrollmentData: DeepPartial<Enrollment>): Enrollment {
    return this.enrollmentRepository.create(enrollmentData);
  }

  /**
   * Guardamos la instancia
   */
  async save(
    enrollmentData: Enrollment | Enrollment[],
  ): Promise<Enrollment | Enrollment[]> {
    return this.enrollmentRepository.save(enrollmentData as any);
  }

  async findEnrollment(enrollmentId: string) {
    return this.enrollmentRepository.findOne({
      where: { id: enrollmentId },
      relations: ['course'],
    });
  }

  /**
   * Metodo que busca las inscripciones por estado de pago query
   */
  private createDetailedQueryBuilder(){
    return this.enrollmentRepository.createQueryBuilder('enrollment').
    leftJoinAndSelect('enrollment.course', 'course').
    leftJoinAndSelect('enrollment.user', 'student').
    leftJoinAndSelect('enrollment.payment', 'payment').
    leftJoinAndSelect('enrollment.payout', 'payout'). 
    leftJoinAndSelect('course.professor', 'professor'). 
    leftJoinAndSelect('professor.user', 'professorUser');
  }

  /**
   * Busca todas las ventas para el admin
   */
  async findSalesForAdmin(status: 'PENDING' | 'PAID' | 'ALL'){
    const qb = this.createDetailedQueryBuilder();

    if(status === 'PENDING') {
      // 3. Usa 'payout' (la relación) no 'payoutId' (la columna)
      qb.where('enrollment.payout IS NULL'); 
    } else if(status === 'PAID'){
      qb.where('enrollment.payout IS NOT NULL');
    }

    return qb.orderBy('enrollment.inscripcionDate', 'DESC').getMany();
  }

  /**
   * Busca todas las ventas para un profesor en especifico
   */
  async findSalesForProfessor(professorId: string, status: 'PENDING' | 'PAID' | 'ALL'){
    const qb = this.createDetailedQueryBuilder();

    //Filtramos por el id del profesor
    qb.where('professor.id = :professorId', {professorId});

    if(status === 'PENDING'){
      qb.andWhere('enrollment.payout IS NULL');
    } else if(status === 'PAID'){
      qb.andWhere('enrollment.payout IS NOT NULL');
    }

    return qb.orderBy('enrollment.inscripcionDate', 'DESC').getMany();
  }
  
  
  /**
   * Busca todas las inscripciones pendientes de pago (payout IS NULL)
   * y carga las relaciones necesarias para el resumen del admin.
   */
  async findPendingSummary(): Promise<Enrollment[]> {
    return this.enrollmentRepository.find({
      where: { payout: IsNull() },
      relations: {
        course: {
          professor: {
            user: true,
          },
        },
      },
    });
  }


  /**
   * Busca todas las ventas pendientes de pago para un profesor específico.
   */
  async findPendingSalesForProfessor(professorId: string): Promise<Enrollment[]> {
    return this.enrollmentRepository.find({
      where: {
        // Busca inscripciones...
        course: {
          professor: { id: professorId } // ...que pertenezcan a este profesor
        },
        payout: IsNull(), // ...y que aún no tengan un lote de pago (payout)
      },
    });
  }
}