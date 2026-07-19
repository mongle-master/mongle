import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Response } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@ApiExcludeController()
@Controller('actuator')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  async health(@Res({ passthrough: true }) response: Response): Promise<{ status: 'UP' | 'DOWN' }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'UP' };
    } catch {
      response.status(HttpStatus.SERVICE_UNAVAILABLE);
      return { status: 'DOWN' };
    }
  }
}
