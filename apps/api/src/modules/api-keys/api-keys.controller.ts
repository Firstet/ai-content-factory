import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';

@ApiTags('API Keys')
@Controller('api-keys')
export class ApiKeysController {
  constructor(private service: ApiKeysService) {}

  @Post()
  create(@Body() dto: CreateApiKeyDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query('providerId') providerId?: string) {
    return this.service.findAll(providerId);
  }

  @Patch(':id/toggle')
  toggle(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.service.toggle(id, isActive);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
