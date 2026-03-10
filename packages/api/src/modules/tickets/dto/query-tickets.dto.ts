import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  BLOCKED = 'BLOCKED',
  WAITING_REVIEW = 'WAITING_REVIEW',
  NEEDS_REVISION = 'NEEDS_REVISION',
  COMPLETED = 'COMPLETED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
}

enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export class QueryTicketsDto {
  @ApiProperty({
    description: 'Filter by ticket status',
    enum: TicketStatus,
    required: false,
    example: 'OPEN',
  })
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;

  @ApiProperty({
    description: 'Filter by priority',
    enum: TicketPriority,
    required: false,
    example: 'HIGH',
  })
  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @ApiProperty({
    description: 'Filter by assigned agent ID',
    required: false,
    example: 'cfda1226-dd6a-4888-8434-8b3090c79458',
  })
  @IsString()
  @IsOptional()
  assignedAgentId?: string;

  @ApiProperty({
    description: 'Page number (starting from 1)',
    required: false,
    minimum: 1,
    default: 1,
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiProperty({
    description: 'Number of items per page',
    required: false,
    minimum: 1,
    default: 20,
    example: 20,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;
}
