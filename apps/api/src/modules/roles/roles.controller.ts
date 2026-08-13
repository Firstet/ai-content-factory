import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@acf/shared';

@ApiTags('Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('roles')
export class RolesController {
  constructor(private service: RolesService) {}
  @Get() findAll() { return this.service.findAll(); }
  @Post() create(@Body() data: any) { return this.service.create(data); }
  @Post(':id/permissions') addPermission(@Param('id') id: string, @Body() b: any) { return this.service.addPermission(id, b.action, b.resource); }
  @Delete('permissions/:id') removePermission(@Param('id') id: string) { return this.service.removePermission(id); }
}
