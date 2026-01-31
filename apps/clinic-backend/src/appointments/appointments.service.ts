import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { format, parseISO, addMinutes, isAfter, isBefore } from 'date-fns';
import { Appointment, AppointmentDocument } from './schemas/appointment.schema';
import { Doctor, DoctorDocument } from '../doctors/schemas/doctor.schema';
import { Specialty, SpecialtyDocument } from './schemas/specialty.schema';
import { GetAvailableSlotsDto } from './dto/get-available-slots.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name)
    private appointmentModel: Model<AppointmentDocument>,
    @InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>,
    @InjectModel(Specialty.name)
    private specialtyModel: Model<SpecialtyDocument>,
  ) {}

  private parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private formatTime(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60)
      .toString()
      .padStart(2, '0');
    const minutes = (totalMinutes % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  async getAllSpecialties() {
    return this.specialtyModel.find();
  }

  async getAvailableSlots(getAvailableSlotsDto: GetAvailableSlotsDto) {
    const { specialtyId, date } = getAvailableSlotsDto;

    if (!specialtyId || !date) {
      throw new BadRequestException('specialtyId and date are required');
    }

    const doctors = await this.doctorModel.find({ specialties: new Types.ObjectId(specialtyId) });

    if (doctors.length === 0) {
      throw new NotFoundException(
        'No doctors with this specialty were found.',
      );
    }

    const allAvailableSlots: Array<{
      doctorId: string;
      doctorName: string;
      specialty: unknown[];
      availableSlots: string[];
      appointmentDuration: number;
    }> = [];
    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate
      .toLocaleString('he-IL', {
        weekday: 'long',
      })
      .replace('יום ', '');

    for (const doctor of doctors) {
      const workingHours = doctor.workingHours.find(
        (wh) => wh.day === dayOfWeek,
      );
      if (!workingHours) {
        continue;
      }

      const occupiedAppointments = await this.appointmentModel.find({
        doctorId: doctor._id,
        date: requestedDate,
      });

      const specialtyDoc = await this.specialtyModel.findById(specialtyId);
      if (!specialtyDoc) {
        throw new NotFoundException('Specialty not found');
      }
      const slotDuration = specialtyDoc.appointmentDuration;
      const workStartTime = this.parseTime(workingHours.workStart);
      const workEndTime = this.parseTime(workingHours.workEnd);
      const slots: Array<{ startTime: string; occupied: boolean }> = [];

      for (let time = workStartTime; time < workEndTime; time += slotDuration) {
        slots.push({ startTime: this.formatTime(time), occupied: false });
      }

      occupiedAppointments.forEach((app) => {
        const appointmentStartTime = this.parseTime(app.startTime);
        const appointmentEndTime = appointmentStartTime + app.duration;

        slots.forEach((slot) => {
          const slotStartTime = this.parseTime(slot.startTime);
          const slotEndTime = slotStartTime + slotDuration;

          if (
            (slotStartTime >= appointmentStartTime &&
              slotStartTime < appointmentEndTime) ||
            (slotEndTime > appointmentStartTime &&
              slotEndTime <= appointmentEndTime)
          ) {
            slot.occupied = true;
          }
        });
      });

      const availableSlots = slots
        .filter((slot) => !slot.occupied)
        .map((slot) => slot.startTime);

      if (availableSlots.length > 0) {
        allAvailableSlots.push({
          doctorId: doctor._id.toString(),
          doctorName: doctor.name,
          specialty: doctor.specialties,
          availableSlots: availableSlots,
          appointmentDuration: specialtyDoc.appointmentDuration,
        });
      }
    }

    return allAvailableSlots;
  }

  async createAppointment(createAppointmentDto: CreateAppointmentDto) {
    const { doctorId, date, startTime, patientId, specialtyId } =
      createAppointmentDto;

    if (!doctorId || !date || !startTime || !patientId || !specialtyId) {
      throw new BadRequestException(
        'doctorId, date, startTime, patientId, and specialtyId are required',
      );
    }

    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate
      .toLocaleString('he-IL', {
        weekday: 'long',
      })
      .replace('יום ', '');

    const doctor = await this.doctorModel.findOne({
      _id: new Types.ObjectId(doctorId),
      'workingHours.day': dayOfWeek,
      specialties: new Types.ObjectId(specialtyId),
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const currentSpeciality = await this.specialtyModel.findById(new Types.ObjectId(specialtyId));
    if (!currentSpeciality) {
      throw new NotFoundException('Specialty not found');
    }
    const appointmentDuration = currentSpeciality.appointmentDuration;

    const requestedStartTime = `${date}T${startTime}:00`;
    const requestedEndTime = format(
      addMinutes(parseISO(requestedStartTime), appointmentDuration),
      'HH:mm',
    );

    const existingAppointments = await this.appointmentModel.find({
      doctorId: new Types.ObjectId(doctorId),
      date: parseISO(date),
    });

    const isOverlap = existingAppointments.some((app) => {
      const existingStartTime = parseISO(`${date}T${app.startTime}:00`);
      const existingEndTime = addMinutes(existingStartTime, app.duration);

      return (
        isBefore(parseISO(requestedStartTime), existingEndTime) &&
        isAfter(parseISO(`${date}T${requestedEndTime}:00`), existingStartTime)
      );
    });

    if (isOverlap) {
      throw new ConflictException('The appointment unavailable');
    }

    const newAppointment = new this.appointmentModel({
      specialtyId: new Types.ObjectId(specialtyId),
      doctorId: new Types.ObjectId(doctorId),
      date: parseISO(date),
      startTime,
      patientId: new Types.ObjectId(patientId),
      duration: appointmentDuration,
    });

    return await newAppointment.save();
  }
}
