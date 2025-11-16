import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PayoutRepository } from "./payouts.repository";
import { Enrollment } from "../enrollments/entities/enrollment.entity";
import { IsNull, Repository } from "typeorm";
import { ProfessorProfile } from "../profiles/entities/professor-profile.entity";
import { Payout } from "./entities/payout.entity";
import { PayoutStatus } from "./enums/PayoutStatus.enum";
import { MailService } from "src/mail/mail.service";
// --- ¡IMPORTA LOS REPOS PERSONALIZADOS! ---
import { EnrollmentRepository } from "../enrollments/enrollments.repository";
import { ProfilesRepository } from "../profiles/profiles.repository";

@Injectable()
export class PayoutService {
    constructor(
        // Repos de este módulo
        private readonly payoutRepository: PayoutRepository,
        // Servicios/Repos de otros módulos
        private readonly mailService: MailService,
        private readonly enrollmentRepository: EnrollmentRepository, // <-- ¡USA EL REPO PERSONALIZADO!
        private readonly professorProfileRepository: ProfilesRepository // <-- ¡USA EL REPO PERSONALIZADO!
    ){}

    async getPendingPayoutSummary() {
        // Busca usando el REPO PERSONALIZADO
        // (Debes crear este método 'findPendingSummary' en EnrollmentRepository)
        const pendingEnrollments = await this.enrollmentRepository.findPendingSummary();

        // 2. Agrupa las ganancias
        const summary = pendingEnrollments.reduce((acc, enrollment) => {
            const professorId = enrollment.course?.professor?.id;
            if (!professorId) return acc;
            
            const earnings = Number(enrollment.professorEarnings);

            if (!acc[professorId]) {
                acc[professorId] = {
                    professorId: professorId,
                    professorName: enrollment.course.professor.user.name, 
                    totalOwed: 0,
                    salesCount: 0,
                };
            }
            acc[professorId].totalOwed += earnings;
            acc[professorId].salesCount += 1;
            return acc;
        }, {});

        return Object.values(summary);
    }
    
    async createPayoutBatch(professorId: string): Promise<Payout> {
        // Usa el REPO PERSONALIZADO
        const professor = await this.professorProfileRepository.findById(professorId); 
        if(!professor) {
            throw new NotFoundException('Perfil del profesor no encontrado')
        }

        // Usa el REPO PERSONALIZADO
        // (Debes crear este método 'findPendingSalesForProfessor' en EnrollmentRepository)
        const pendindEnrollments = await this.enrollmentRepository.findPendingSalesForProfessor(professorId);

        if(pendindEnrollments.length === 0){
            throw new NotFoundException('Este profesor no tiene ganacias pendientes por pagar')
        }

        const totalAmount = pendindEnrollments.reduce((acc, e) => acc +Number(e.professorEarnings), 0);

        const newPayout = this.payoutRepository.create({
            professor,
            totalAmount,
            status: PayoutStatus.PENDING,
            enrollments: pendindEnrollments
        });

        return this.payoutRepository.save(newPayout);
    }

    async markPayoutAsPaid(payoutId: string, referenceNumber: string){
        // ... (Esta lógica está bien porque usa 'payoutRepository') ...
        const payout = await this.payoutRepository.findById(payoutId);
        // ... (resto del método)
        if(!payout) {
            throw new NotFoundException('Lote de pago no encontrado')
        }
        if(!payout.professor || !payout.professor.user) {
            throw new NotFoundException('No se pud encontrar el usuario profesor asociado a este pago')
        }
        payout.status = PayoutStatus.PAID;
        payout.referenceNumber = referenceNumber;
        payout.paidAt = new Date();
        const savedPayout = await this.payoutRepository.save(payout)
        try {
            await this.mailService.sendPayoutConfirmationEmail(payout.professor.user, savedPayout)
        } catch (emailError) {
            throw new BadRequestException('Error al enviar el email de confirmación de pago')
        }
        return savedPayout
    }

    async getSalesHistory(status: 'PENDING' | 'PAID' | 'ALL') {
        // Usa el REPO PERSONALIZADO
        const sales = await this.enrollmentRepository.findSalesForAdmin(status);

        //Formateamos la vista para el profesor
        return sales.map(sale => ({
            // ... (tu lógica de map está bien) ...
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
        }));
    }
}