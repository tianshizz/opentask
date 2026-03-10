import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class ApproveTicketDto {
  @ApiProperty({
    description: 'Optional approval message',
    example: 'Looks good! Approved.',
    required: false,
  })
  @IsString()
  @IsOptional()
  message?: string;
}
