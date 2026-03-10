import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RequestRevisionDto {
  @ApiProperty({
    description: 'Message explaining what needs to be revised',
    example: 'Please add unit tests for the new authentication method',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
