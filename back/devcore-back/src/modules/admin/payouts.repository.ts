import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Payout } from "./entities/payout.entity";
import { DeepPartial, Repository } from "typeorm";
import { PayoutStatus } from "./enums/PayoutStatus.enum";

@Injectable()
export class PayoutRepository {
    constructor(@InjectRepository(Payout) private readonly payoutRepository: Repository<Payout>){}

    create(payoutData: DeepPartial<Payout>): Payout{
        return this.payoutRepository.create(payoutData)
    }

    save(payout: Payout): Promise<Payout> {
        return this.payoutRepository.save(payout);
    }

    findById(id: string): Promise<Payout | null> {
        return this.payoutRepository.findOne({where: {id}, relations: ['professor', 'professor.user','enrollments','enrollments.course']})
    }

    /**
     * Metodo para buscar lotes de pago filtrados por paid y pending
     */
    async findByStatus(status?: PayoutStatus): Promise<Payout[]> {
        //consultra para traer las relaciones necesarias
        const queryOptions = {
            relations: {
                professor: {
                    user: true,
                },
                enrollments: true,
            },
            order:{
                createdAt: 'DESC'
            } as any,
            where: {}
        };

        //Si se manda un estado se agrega al where
        if(status) {
            queryOptions.where = {
                status: status
            }
        }
        return this.payoutRepository.find(queryOptions)
    }
}