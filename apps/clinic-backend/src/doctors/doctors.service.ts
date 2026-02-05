import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Doctor, DoctorDocument } from "./schemas/doctor.schema";
import { CreateDoctorDto } from "./dto/create-doctor.dto";
import { UpdateDoctorDto } from "./dto/update-doctor.dto";

@Injectable()
export class DoctorsService {
  constructor(
    @InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>
  ) {}

  async findAll() {
    return this.doctorModel.find().populate("specialties");
  }

  async findOne(id: string) {
    const doctor = await this.doctorModel.findById(id).populate("specialties");
    if (!doctor) {
      throw new NotFoundException("Doctor not found");
    }
    return doctor;
  }

  async create(createDoctorDto: CreateDoctorDto) {
    try {
      const { name, img, description, specialties, workingHours } =
        createDoctorDto;

      if (!name || !specialties || specialties.length === 0) {
        throw new BadRequestException(
          "Name and at least one specialty are required"
        );
      }

      const doctor = new this.doctorModel({
        name,
        img,
        description,
        specialties: specialties.map((id) => new Types.ObjectId(id)),
        workingHours: workingHours || [],
      });

      return await doctor.save();
    } catch (err: any) {
      if (err instanceof BadRequestException) {
        throw err;
      }
      console.error("Create doctor error:", err);
      throw new BadRequestException(
        "Failed to create doctor. Please try again."
      );
    }
  }

  async update(id: string, updateDoctorDto: UpdateDoctorDto) {
    try {
      const doctor = await this.doctorModel.findById(id);
      if (!doctor) {
        throw new NotFoundException("Doctor not found");
      }

      const { name, img, description, specialties, workingHours } =
        updateDoctorDto;

      // Update fields if provided
      if (name !== undefined) {
        doctor.name = name;
      }
      if (img !== undefined) {
        doctor.img = img;
      }
      if (description !== undefined) {
        doctor.description = description;
      }
      if (specialties !== undefined) {
        if (specialties.length === 0) {
          throw new BadRequestException("At least one specialty is required");
        }
        doctor.specialties = specialties.map(
          (specialtyId) => new Types.ObjectId(specialtyId)
        );
      }
      if (workingHours !== undefined) {
        doctor.workingHours = workingHours;
      }

      const updatedDoctor = await doctor.save();
      return await this.doctorModel
        .findById(updatedDoctor._id)
        .populate("specialties");
    } catch (err: any) {
      if (
        err instanceof NotFoundException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }
      console.error("Update doctor error:", err);
      throw new BadRequestException(
        "Failed to update doctor. Please try again."
      );
    }
  }

  async remove(id: string) {
    const doctor = await this.doctorModel.findByIdAndDelete(id);
    if (!doctor) {
      throw new NotFoundException("Doctor not found");
    }
    return { message: "Doctor deleted successfully" };
  }
}
