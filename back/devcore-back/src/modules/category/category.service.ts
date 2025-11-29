import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriesRepository } from './category.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import slugify from 'slugify';
import { Not } from 'typeorm';

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

  async getAllCategories() {
    return await this.categoriesRepository.getAllCategories();
  }

  async getCategoryById(categoryId) {
   const categoryFind = await this.categoriesRepository.getCategoryById(categoryId)
   if (!categoryFind) throw new NotFoundException('Categoria no encontrada')
    return categoryFind
  }

  async desactiveCategory(categoryId: string){
    const categoryFind = await this.categoriesRepository.getCategoryById(categoryId)
    if (!categoryFind) throw new NotFoundException('Categoria no encontrada')
    categoryFind.status = false;
    await this.categoriesRepository.createCategory(categoryFind)
    return categoryFind;
  }


}
