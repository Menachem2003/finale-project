import { Controller, Get, Post, Query, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { GetAvailableSlotsDto } from './dto/get-available-slots.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@ApiTags('appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get('specialties')
  @ApiOperation({ summary: 'Get all specialties' })
  @ApiResponse({ status: 200, description: 'Specialties retrieved successfully' })
  async getAllSpecialties() {
    return this.appointmentsService.getAllSpecialties();
  }

  @Get('available-slots')
  @ApiOperation({ summary: 'Get available appointment slots' })
  @ApiResponse({
    status: 200,
    description: 'Available slots retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'No doctors or specialty found' })
  async getAvailableSlots(@Query() queryDto: GetAvailableSlotsDto) {
    return this.appointmentsService.getAvailableSlots(queryDto);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiResponse({
    status: 201,
    description: 'Appointment created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Doctor or specialty not found' })
  @ApiResponse({ status: 409, description: 'Appointment unavailable' })
  async createAppointment(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.createAppointment(createAppointmentDto);
  }
}
