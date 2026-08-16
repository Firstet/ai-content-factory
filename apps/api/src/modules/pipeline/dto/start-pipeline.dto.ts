import { IsString, IsOptional, IsUUID, IsInt, Min, Max, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartPipelineDto {
  @ApiProperty({ example: 'How AI is changing content creation in 2025' })
  @IsString()
  topic: string;

  @ApiProperty({ description: 'Brand ID', required: false })
  @IsOptional()
  @IsUUID()
  brandId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  channelId?: string;

  @ApiProperty({ example: 10, description: 'Target video duration in minutes' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  targetDuration?: number;

  @ApiProperty({ required: false, example: 'Tech-savvy professionals aged 25-40' })
  @IsOptional()
  @IsString()
  targetAudience?: string;

  @ApiProperty({ required: false, default: 'English' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({ required: false, example: 'Educational and engaging' })
  @IsOptional()
  @IsString()
  tone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ required: false, default: true, description: 'Run all pipeline steps automatically' })
  @IsOptional()
  @IsBoolean()
  runFullPipeline?: boolean;
}
