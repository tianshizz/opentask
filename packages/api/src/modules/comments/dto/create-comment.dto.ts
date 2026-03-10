import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';

enum CommentType {
  COMMENT = 'COMMENT',
  HUMAN_FEEDBACK = 'HUMAN_FEEDBACK',
  AGENT_UPDATE = 'AGENT_UPDATE',
  STATUS_CHANGE = 'STATUS_CHANGE',
  SYSTEM_NOTE = 'SYSTEM_NOTE',
}

export class CreateCommentDto {
  @ApiProperty({
    description: 'Ticket ID',
    example: 'f0ac3da6-d99e-4b44-acf4-890b8c3f3344',
  })
  @IsString()
  ticketId: string;

  @ApiProperty({
    description: 'Author (Actor) ID',
    example: 'e2c54963-3617-4b9d-ba38-63bf3027ed80',
  })
  @IsString()
  authorId: string;

  @ApiProperty({
    description: 'Comment content',
    example: 'I reviewed the code and it looks good. Approved!',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Type of comment',
    enum: CommentType,
    example: 'HUMAN_FEEDBACK',
    required: false,
  })
  @IsEnum(CommentType)
  @IsOptional()
  type?: CommentType;
}
