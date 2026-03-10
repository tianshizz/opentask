import { IsString, IsOptional, IsEnum, IsUUID, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketPriority } from '@prisma/client';

export class CreateTicketDto {
  @ApiProperty({ example: 'Fix authentication bug' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Users cannot login with OAuth' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: TicketPriority, default: 'MEDIUM' })
  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @ApiPropertyOptional({ type: [String], example: ['bug', 'auth'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  assignedAgentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  agentMetadata?: Record<string, any>;
}
