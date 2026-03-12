import { IsOptional, IsString, IsArray, IsEnum, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TicketStatus, TicketPriority } from '@prisma/client';
import { Type } from 'class-transformer';

export class SearchTicketsDto {
  @ApiPropertyOptional({ 
    description: 'Search query for title and description',
    example: 'bug fix'
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ 
    enum: TicketStatus, 
    isArray: true,
    description: 'Filter by ticket status',
    example: ['OPEN', 'IN_PROGRESS']
  })
  @IsOptional()
  @IsArray()
  @IsEnum(TicketStatus, { each: true })
  status?: TicketStatus[];

  @ApiPropertyOptional({ 
    enum: TicketPriority, 
    isArray: true,
    description: 'Filter by priority',
    example: ['HIGH', 'URGENT']
  })
  @IsOptional()
  @IsArray()
  @IsEnum(TicketPriority, { each: true })
  priority?: TicketPriority[];

  @ApiPropertyOptional({
    description: 'Filter by assigned agent ID'
  })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiPropertyOptional({
    description: 'Filter by creator ID'
  })
  @IsOptional()
  @IsString()
  createdBy?: string;

  @ApiPropertyOptional({ 
    isArray: true,
    description: 'Filter by tags',
    example: ['bug', 'frontend']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ 
    enum: ['createdAt', 'updatedAt', 'priority'],
    description: 'Sort by field',
    default: 'createdAt'
  })
  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'updatedAt' | 'priority';

  @ApiPropertyOptional({ 
    enum: ['asc', 'desc'],
    description: 'Sort order',
    default: 'desc'
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({ 
    minimum: 1,
    description: 'Page number',
    default: 1
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ 
    minimum: 1,
    maximum: 100,
    description: 'Items per page',
    default: 20
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;
}
