import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum } from 'class-validator';

export class CompleteAttemptDto {
  @ApiProperty({
    description: 'Outcome description',
    example: 'Successfully fixed the OAuth configuration. Tests passing.',
  })
  @IsString()
  outcome: string;

  @ApiProperty({
    description: 'Final status of the attempt',
    enum: ['SUCCESS', 'FAILED', 'PARTIAL'],
    example: 'SUCCESS',
  })
  @IsEnum(['SUCCESS', 'FAILED', 'PARTIAL'])
  status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
}
