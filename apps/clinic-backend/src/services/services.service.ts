import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Service, ServiceDocument } from './schemas/service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
  ) {}

  async findAll() {
    return this.serviceModel.find();
  }

  async findOne(id: string) {
    const service = await this.serviceModel.findById(id);
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return service;
  }

  async create(createServiceDto: CreateServiceDto) {
    try {
      const service = new this.serviceModel(createServiceDto);
      return await service.save();
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  async update(id: string, updateServiceDto: UpdateServiceDto) {
    const service = await this.serviceModel.findByIdAndUpdate(
      id,
      updateServiceDto,
      {
        new: true,
        runValidators: true,
      },
    );
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return service;
  }

  async remove(id: string) {
    const result = await this.serviceModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Service not found');
    }
    return { success: true };
  }
}
