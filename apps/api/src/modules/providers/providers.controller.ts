import { Controller, Get, Put, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProvidersService } from './providers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@acf/shared';

@ApiTags('Providers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('providers')
export class ProvidersController {
  constructor(private service: ProvidersService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Patch(':id/toggle')
  @Roles(UserRole.ADMIN)
  toggle(@Param('id') id: string, @Body('enabled') enabled: boolean) {
    return this.service.toggle(id, enabled);
  }

  @Put(':id/config')
  @Roles(UserRole.ADMIN)
  updateConfig(@Param('id') id: string, @Body() data: any) {
    return this.service.updateConfig(id, data);
  }
}
