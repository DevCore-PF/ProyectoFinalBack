import { Injectable } from '@nestjs/common';
import { CategoriesRepository } from './category.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import slugify from 'slugify';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async createCategory(data) {
    const slug = slugify(data.name);
    const status = true;
    return await this.categoriesRepository.createCategory({
      ...data,
      slug,
      status,
    });
  }
}
