import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketPriority } from '@prisma/client';

export class CreateSubtaskDto {
  @ApiProperty({
    description: 'Title of the subtask',
    example: 'Implement API endpoint'
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the subtask'
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    enum: TicketPriority,
    description: 'Priority of the subtask',
    default: 'MEDIUM'
  })
  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @ApiPropertyOptional({
    description: 'Agent assigned to this subtask'
  })
  @IsString()
  @IsOptional()
  assignedAgentId?: string;

  @ApiPropertyOptional({
    description: 'Tags for the subtask',
    type: [String]
  })
  @IsOptional()
  tags?: string[];
}
