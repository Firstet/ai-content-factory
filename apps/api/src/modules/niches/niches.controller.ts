import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { NichesService } from './niches.service';

@Controller('niches')
export class NichesController {
  constructor(private readonly nichesService: NichesService) {}

  @Get()
  async findAll() {
    return this.nichesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.nichesService.findOne(id);
  }

  @Post()
  async createCustom(@Body() body: { name: string; description?: string; category?: string }) {
    return this.nichesService.createCustomNiche(body.name, body.description, body.category);
  }

  @Post(':id/intelligence/refresh')
  async refreshIntelligence(@Param('id') id: string) {
    return this.nichesService.refreshNicheIntelligence(id);
  }
}
