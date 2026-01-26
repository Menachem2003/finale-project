import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async findAll(queryDto: QueryProductsDto) {
    const { name = '', category = '', min = 0, max = Infinity } = queryDto;

    const query: any = {
      name: new RegExp(name as string, 'i'),
      category: new RegExp(category as string, 'i'),
      price: { $gte: Number(min), $lte: Number(max) },
    };

    return this.productModel.find(query);
  }

  async getCategories() {
    return this.productModel.distinct('category');
  }

  async findOne(id: string) {
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async create(createProductDto: CreateProductDto) {
    try {
      const product = new this.productModel(createProductDto);
      return await product.save();
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productModel.findByIdAndUpdate(
      id,
      updateProductDto,
      { new: true },
    );
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async remove(id: string) {
    const result = await this.productModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Product not found');
    }
    return { message: 'Product deleted' };
  }
}
