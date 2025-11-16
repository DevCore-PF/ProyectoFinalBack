import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PayoutRepository } from "./payouts.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { Enrollment } from "../enrollments/entities/enrollment.entity";
import { IsNull, Repository } from "typeorm";
import { ProfessorProfile } from "../profiles/entities/professor-profile.entity";
import { Payout } from "./entities/payout.entity";
import { PayoutStatus } from "./enums/PayoutStatus.enum";
import { MailService } from "src/mail/mail.service";
import { EnrollmentRepository } from "../enrollments/enrollments.repository";

@Injectable()
export class PayoutService {
    constructor(private readonly payoutRepository: PayoutRepository,
        @InjectRepository(Enrollment) private readonly enrollmentRepository: Repository<Enrollment>,
        @InjectRepository(ProfessorProfile) private readonly professorProfileRepository: Repository<ProfessorProfile>,
        private readonly mailService: MailService,
        private readonly enrollmentFindPayRepository: EnrollmentRepository
    ){}

    /**
     * Pbtiene un resumen de todas las ganacias pendientes agrupadar por profesor
     */
    async getPendingPayoutSummary() {
    
    // 1. Busca todas las inscripciones pendientes
    const pendingEnrollments = await this.enrollmentRepository.find({
      where: { payout: IsNull() },
      // Usamos la sintaxis de objeto para cargar relaciones anidadas   
      relations: {
        course: {         // Carga la relación 'course'|A
          professor: {    // Dentro de 'course', carga 'professor'
            user: true,   // Y dentro de 'professor', carga 'user'
          },
        },
      },
    });

    // 2. Agrupa las ganancias por ID de profesor
    const summary = pendingEnrollments.reduce((acc, enrollment) => {
      // (Esta parte es sensible. Si un curso no tiene profesor, podría fallar)
      // Añadimos un '?' por seguridad
      const professorId = enrollment.course?.professor?.id;
      
      // Si por alguna razón no hay profesor, omitimos esta venta del resumen
      if (!professorId) {
        return acc;
      }
      
      const earnings = Number(enrollment.professorEarnings);

      if (!acc[professorId]) {
        acc[professorId] = {
          professorId: professorId,
          // Ahora 'enrollment.course.professor.user' SÍ existe
          professorName: enrollment.course.professor.user.name, 
          totalOwed: 0,
          salesCount: 0,
        };
      }
      
      acc[professorId].totalOwed += earnings;
      acc[professorId].salesCount += 1;
      return acc;
    }, {});

    // 3. Convierte el objeto en un arreglo
    return Object.values(summary);
  }
    
    /**
     * Creamos un lote de pago para un profesor especifico
     */
    async createPayoutBatch(professorId: string): Promise<Payout> {
        //Buscamos al profesor
        const professor = await this.professorProfileRepository.findOneBy({id: professorId});

        if(!professor) {
            throw new NotFoundException('Perfil del profesor no encontrado')
        }

        //Buscamos todas las ventas pendientes por pagar de este profesor
        const pendindEnrollments = await this.enrollmentRepository.find({
            where: {
                course: {professor: {id: professorId}},
                payout: IsNull()
            }
        });

        if(pendindEnrollments.length === 0){
            throw new NotFoundException('Este profesor no tiene ganacias pendientes por pagar')
        }

        //Calculamos el total
        const totalAmount = pendindEnrollments.reduce((acc, e) => acc +Number(e.professorEarnings), 0);

        //Creamos el lote de pago de payout
        const newPayout = this.payoutRepository.create({
            professor,
            totalAmount,
            status: PayoutStatus.PENDING,
            enrollments: pendindEnrollments
        })

        //guardamos el payout
        return this.payoutRepository.save(newPayout);
    }

    /**
     * el admin marca como pagado u lote y debe aadir la referencia de pago
     */
    async markPayoutAsPaid(payoutId: string, referenceNumber: string){
        //Buscamos el lote de pago
        const payout = await this.payoutRepository.findById(payoutId);

        if(!payout) {
            throw new NotFoundException('Lote de pago no encontrado')
        }

        if(!payout.professor || !payout.professor.user) {
            throw new NotFoundException('No se pud encontrar el usuario profesor asociado a este pago')
        }

        //le pasamos los datos para marcarlo como pagada y la referencia
        payout.status = PayoutStatus.PAID;
        payout.referenceNumber = referenceNumber;
        payout.paidAt = new Date();

        //gaurdamos
        const savedPayout = await this.payoutRepository.save(payout)

        try {
            await this.mailService.sendPayoutConfirmationEmail(payout.professor.user, savedPayout)
        } catch (emailError) {
            throw new BadRequestException('Error al enviar el email de confirmación de pago')
        }

        return savedPayout
    }

    /**
     * Metodo que obtiene el historia de todas las ventas del sistema
     */
    async getSalesHistory(status: 'PENDING' | 'PAID' | 'ALL') {
        //llamamso al metodo del repotisory
        const sales = await this.enrollmentFindPayRepository.findSalesForAdmin(status);

        //Formateamos la vista para el profesor
        return sales.map(sale => ({
            saleID: sale.id,
            saleDate: sale.inscripcionDate,
            courseTitle: sale.course.title,
            studentName: sale.user.name,
            studentEmail: sale.user.email,
            professorName: sale.course.professor.user.name,
            totalPrice: sale.priceAtPurchase,
            professorEarnings: sale.professorEarnings,
            adminEarnings: sale.adminEarnings,
            paymentId: sale.payment.id,
            stripeID: sale.payment.stripeId,
            payoutStatus: sale.payout ? 'Pagado' : 'Pendiente'
        }))
    }
}