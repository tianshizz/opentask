import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsEmail, IsOptional } from 'class-validator';

enum ActorType {
  HUMAN = 'HUMAN',
  AGENT = 'AGENT',
}

export class CreateActorDto {
  @ApiProperty({
    description: 'Actor name',
    example: 'Alice Developer',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Actor type',
    enum: ActorType,
    example: 'HUMAN',
  })
  @IsEnum(ActorType)
  type: ActorType;

  @ApiProperty({
    description: 'Actor email address',
    example: 'alice@company.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;
}
