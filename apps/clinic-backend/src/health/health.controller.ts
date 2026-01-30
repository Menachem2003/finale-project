import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Root endpoint' })
  @ApiResponse({ status: 200, description: 'Hello World' })
  getHello() {
    return {
      message: 'Hello World!',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint (public)' })
  @ApiResponse({ status: 200, description: 'Service health status' })
  async getHealth() {
    const dbHealth = await this.healthService.checkDatabase();
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: dbHealth,
    };
  }

  @Get('health/auth')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Authenticated health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAuthHealth() {
    const dbHealth = await this.healthService.checkDatabase();
    return {
      status: 'ok',
      message: 'Authenticated health check passed',
      timestamp: new Date().toISOString(),
      database: dbHealth,
    };
  }
}
