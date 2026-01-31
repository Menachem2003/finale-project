import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ReferralsService } from './referrals.service';
import { CreateReferralDto } from './dto/create-referral.dto';
import { UpdateReferralStatusDto } from './dto/update-referral-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.guard';

@ApiTags('referrals')
@Controller()
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Post('contact')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new referral (public endpoint)' })
  @ApiResponse({
    status: 201,
    description: 'Referral created successfully',
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@Body() createReferralDto: CreateReferralDto) {
    try {
      return await this.referralsService.create(createReferralDto);
    } catch (error) {
      console.error('Controller error creating referral:', error);
      throw error;
    }
  }

  @Get('referrals')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all referrals (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Referrals retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll() {
    return this.referralsService.findAll();
  }

  @Get('referrals/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get referral by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Referral retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Referral not found' })
  async findOne(@Param('id') id: string) {
    return this.referralsService.findOne(id);
  }

  @Put('referrals/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update referral status (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Referral status updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Referral not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateReferralStatusDto,
  ) {
    return this.referralsService.updateStatus(id, updateStatusDto);
  }
}
