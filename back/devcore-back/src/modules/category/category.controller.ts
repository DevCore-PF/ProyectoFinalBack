import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { CategoriesService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ApiCreateCategoryDoc } from './doc/createCategory.doc';
import { AuthGuard } from '@nestjs/passport';
import { Roles, RolesGuard } from '../auth/guards/verify-role.guard';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post('add')
  @ApiCreateCategoryDoc()
  // @UseGuards(AuthGuard, RolesGuard)
  // @Roles('admin')
  async createCategory(@Body() data: CreateCategoryDto) {
    return await this.categoriesService.createCategory(data);
  }

  @Get()
  async getAllCategories() {
    return await this.categoriesService.getAllCategories();
  }

  @Get('/:categoryId')
  async getCategorybyId(@Param('categoryId', ParseUUIDPipe) categoryId: string){
    return await this.categoriesService.getCategoryById(categoryId)
  }

  @Patch('desactivate/:categoryId')
    async desactiveCategory(@Param('categoryId', ParseUUIDPipe) categoryId: string) {
      return await this.categoriesService.desactiveCategory(categoryId);
    }
  
}
