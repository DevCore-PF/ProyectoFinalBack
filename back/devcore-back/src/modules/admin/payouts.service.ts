import { Injectable, NotFoundException } from "@nestjs/common";
import { PayoutRepository } from "./payouts.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { Enrollment } from "../enrollments/entities/enrollment.entity";
import { IsNull, Repository } from "typeorm";
import { ProfessorProfile } from "../profiles/entities/professor-profile.entity";
import { Payout } from "./entities/payout.entity";
import { PayoutStatus } from "./enums/PayoutStatus.enum";

@Injectable()
export class PayoutService {
    constructor(private readonly payoutRepository: PayoutRepository,
        @InjectRepository(Enrollment) private readonly enrollmentRepository: Repository<Enrollment>,
        @InjectRepository(ProfessorProfile) private readonly professorProfileRepository: Repository<ProfessorProfile>
    ){}

    /**
     * Pbtiene un resumen de todas las ganacias pendientes agrupadar por profesor
     */
    async getPendingPayoutSummary(){
        //Buscamos todas las inscriciones que aun no han sido pagadas(payoutId es null)
        const pendingEnrollments = await this.enrollmentRepository.find({
            where: { payout: IsNull()},
            relations: ['course', 'course.professor']
        });

        //Agrupamos las ganancias por id de profesor
        const sumary = pendingEnrollments.reduce((acc, enrollment) => {
            const professorId = enrollment.course.professor.id;
            const earnings = Number(enrollment.professsorEarnings);

            if(!acc[professorId]) {
                acc[professorId] = {
                    professorId: professorId,
                    professorName: enrollment.course.professor.user.name,
                    totalOweb: 0,
                    salesCount: 0
                }
            }

            acc[professorId].totalOweb += earnings;
            acc[professorId].salesCount += 1;

            return acc
        },{});

        //convetimos el objeto en un arreglo
        return Object.values(sumary);
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
        const totalAmount = pendindEnrollments.reduce((acc, e) => acc +Number(e.professsorEarnings), 0);

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

        //le pasamos los datos para marcarlo como pagada y la referencia
        payout.status = PayoutStatus.PAID;
        payout.referenceNumber = referenceNumber;
        payout.paidAt = new Date();

        //gaurdamos
        return this.payoutRepository.save(payout);
    }
}