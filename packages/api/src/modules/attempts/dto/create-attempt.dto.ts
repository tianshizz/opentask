import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateAttemptDto {
  @ApiProperty({
    description: 'Ticket ID',
    example: 'f0ac3da6-d99e-4b44-acf4-890b8c3f3344',
  })
  @IsString()
  ticketId: string;

  @ApiProperty({
    description: 'Agent ID',
    example: 'cfda1226-dd6a-4888-8434-8b3090c79458',
  })
  @IsString()
  agentId: string;

  @ApiProperty({
    description: 'Reasoning for this attempt',
    example: 'Attempting to fix the authentication issue by updating the OAuth configuration',
    required: false,
  })
  @IsString()
  @IsOptional()
  reasoning?: string;
}
