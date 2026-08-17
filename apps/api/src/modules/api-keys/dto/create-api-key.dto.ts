import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApiKeyDto {
  @ApiProperty({ description: 'Provider DB ID or Provider Name (e.g. OPENAI, GEMINI, NVIDIA)' })
  @IsString()
  providerId: string;

  @ApiProperty({ example: 'NVIDIA Nemotron Key' })
  @IsString()
  label: string;

  @ApiProperty({ example: 'nvapi-...', description: 'The raw API key (will be encrypted)' })
  @IsOptional()
  @IsString()
  key?: string;

  @ApiProperty({ required: false, description: 'Base URL endpoint (e.g. https://integrate.api.nvidia.com/v1)' })
  @IsOptional()
  @IsString()
  platform?: string;

  @ApiProperty({ required: false, default: 'api' })
  @IsOptional()
  @IsString()
  keyType?: string;

  @ApiProperty({ required: false, example: 'TEXT_RESEARCH_SCRIPT', description: 'Task assigned to this key (TEXT_RESEARCH_SCRIPT, IMAGE_GENERATION, VOICE_TTS, ALL_IN_ONE)' })
  @IsOptional()
  @IsString()
  assignedTask?: string;

  @ApiProperty({ required: false, example: 'nvidia/nvidia-nemotron-nano-9b-v2', description: 'Model ID for this key' })
  @IsOptional()
  @IsString()
  modelName?: string;

  @ApiProperty({ required: false, example: 'https://integrate.api.nvidia.com/v1', description: 'Base URL endpoint' })
  @IsOptional()
  @IsString()
  baseUrl?: string;
}
