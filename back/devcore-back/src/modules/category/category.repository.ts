import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CategoriesRepository {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async createCategory(data) {
    return this.categoriesRepository.save(data);
  }

  async getAllCategories() {
    return this.categoriesRepository.find({ where: { status: true } });
  }

  async getCategoryById(categoryId: string): Promise <Category | null> {
    return await this.categoriesRepository.findOne({where: {id: categoryId}});
  }


}
