import { InjectRepository } from '@nestjs/typeorm';
import { ProfessorProfile } from './entities/professor-profile.entity';
import { DeepPartial, Repository } from 'typeorm';

export class ProfilesRepository {
  constructor(
    @InjectRepository(ProfessorProfile)
    private readonly profileRepository: Repository<ProfessorProfile>,
  ) {}

  /**
   * Crea una nueva instancia de la entidad de perfil (sin guardar)
   */
  create(profileData: DeepPartial<ProfessorProfile>): ProfessorProfile {
    return this.profileRepository.create(profileData);
  }

  /**
   * Guarda (crea o actualiza) un perfil de profesor en la base de datos
   */
  save(profile: ProfessorProfile): Promise<ProfessorProfile> {
    return this.profileRepository.save(profile);
  }

  /**
   * Busca un perfil de profesor usando el ID del usuario (la relación)
   */
  async findByUserId(userId: string): Promise<ProfessorProfile> {
    const profile = await this.profileRepository.findOne({
      where: {
        user: { id: userId },
      },
    });
    if (!profile) {
      throw new Error(`Profile not found for user ${userId}`);
    }
    return profile;
  }

  /**
   * Busca un perfil de profesor por su propio ID
   */

  async findById(id: string): Promise<ProfessorProfile> {
    const profile = await this.profileRepository.findOne({
      where: { id },
      relations: [
        'courses',
        'courses.lessons',
        'user',
        'user.professorProfile',
      ],
    });
    if (!profile) {
      throw new Error(`Profile not found with id ${id}`);
    }
    return profile;
  }
}
