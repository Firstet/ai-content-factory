import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApiKeyDto {
  @ApiProperty({ description: 'Provider DB ID or Provider Name (e.g. OPENAI, GEMINI)' })
  @IsString()
  providerId: string;

  @ApiProperty({ example: 'Production OpenAI Key' })
  @IsString()
  label: string;

  @ApiProperty({ example: 'sk-...', description: 'The raw API key (will be encrypted)' })
  @IsString()
  @MinLength(4)
  key: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  platform?: string;

  @ApiProperty({ required: false, default: 'api' })
  @IsOptional()
  @IsString()
  keyType?: string;
}
