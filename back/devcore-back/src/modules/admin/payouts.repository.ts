import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Payout } from "./entities/payout.entity";
import { DeepPartial, Repository } from "typeorm";

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
        return this.payoutRepository.findOne({where: {id}, relations: ['professor', 'enrollments']})
    }
}