import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async findAll() {
    return this.categoryModel.find();
  }

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const category = new this.categoryModel(createCategoryDto);
      return await category.save();
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  async update(categoryCode: string, updateCategoryDto: UpdateCategoryDto) {
    const { name } = updateCategoryDto;
    if (!name) {
      throw new BadRequestException('Name is required to update category.');
    }

    const category = await this.categoryModel.findOneAndUpdate(
      { categoryCode },
      { name },
      { new: true },
    );

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }
}
