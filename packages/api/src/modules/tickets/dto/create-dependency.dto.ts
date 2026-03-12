import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDependencyDto {
  @ApiProperty({
    description: 'ID of the ticket that depends on another',
    example: 'uuid-ticket-1'
  })
  @IsString()
  @IsNotEmpty()
  ticketId: string;

  @ApiProperty({
    description: 'ID of the ticket that is depended upon',
    example: 'uuid-ticket-2'
  })
  @IsString()
  @IsNotEmpty()
  dependsOnTicketId: string;

  @ApiPropertyOptional({
    description: 'Type of dependency relationship',
    example: 'blocks',
    default: 'blocks'
  })
  @IsString()
  @IsOptional()
  dependencyType?: string;
}
