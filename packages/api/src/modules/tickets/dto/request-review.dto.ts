import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class RequestReviewDto {
  @ApiProperty({
    description: 'Optional message explaining why review is needed',
    example: 'Please review the changes I made to the authentication logic',
    required: false,
  })
  @IsString()
  @IsOptional()
  message?: string;
}
