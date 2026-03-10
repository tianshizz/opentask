import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class AddStepDto {
  @ApiProperty({
    description: 'Action description',
    example: 'Analyzed authentication configuration',
  })
  @IsString()
  action: string;

  @ApiProperty({
    description: 'Input data for this step',
    example: { configFile: 'auth.config.ts', lineNumber: 42 },
    required: false,
  })
  @IsOptional()
  input?: any;

  @ApiProperty({
    description: 'Output/result from this step',
    example: { findings: ['OAuth client ID mismatch', 'Missing redirect URI'] },
    required: false,
  })
  @IsOptional()
  output?: any;
}
