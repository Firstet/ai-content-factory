import { Controller, Get, Put, Patch, Post, Param, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProvidersService } from './providers.service';

@ApiTags('Providers')
@Controller('providers')
export class ProvidersController {
  constructor(private service: ProvidersService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('routes')
  getTaskRoutes() {
    return this.service.getTaskRoutes();
  }

  @Post('routes')
  upsertTaskRoute(@Body() data: any) {
    return this.service.upsertTaskRoute(data);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/toggle')
  toggle(@Param('id') id: string, @Body('enabled') enabled: boolean) {
    return this.service.toggle(id, enabled);
  }

  @Put(':id/config')
  updateConfig(@Param('id') id: string, @Body() data: any) {
    return this.service.updateConfig(id, data);
  }
}
