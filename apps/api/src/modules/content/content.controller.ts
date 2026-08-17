import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ContentProjectService, CreateProjectDto } from './content-project.service';

@Controller('content/projects')
export class ContentController {
  constructor(private readonly projectService: ContentProjectService) {}

  @Get()
  async findAll() {
    return this.projectService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.projectService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateProjectDto) {
    return this.projectService.create(dto);
  }

  @Post(':id/generate')
  async generateCampaign(@Param('id') id: string) {
    return this.projectService.generateCampaign(id);
  }

  @Post('slides/:slideId/regenerate')
  async regenerateSlide(@Param('slideId') slideId: string, @Body() body: { instruction?: string }) {
    return this.projectService.regenerateSlide(slideId, body.instruction);
  }

  @Post('scenes/:sceneId/regenerate')
  async regenerateScene(@Param('sceneId') sceneId: string, @Body() body: { instruction?: string }) {
    return this.projectService.regenerateScene(sceneId, body.instruction);
  }
}
