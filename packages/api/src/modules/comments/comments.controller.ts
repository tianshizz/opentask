import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create a comment',
    description: 'Add a comment to a ticket. Can be used for feedback, updates, or general discussion.'
  })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  @ApiResponse({ status: 404, description: 'Ticket or author not found' })
  create(@Body() createCommentDto: CreateCommentDto) {
    return this.commentsService.create(
      createCommentDto.ticketId,
      createCommentDto.authorId,
      createCommentDto.content,
      createCommentDto.type
    );
  }

  @Get('ticket/:ticketId')
  @ApiOperation({ 
    summary: 'Get comments for a ticket',
    description: 'Retrieve all comments associated with a specific ticket'
  })
  @ApiParam({ name: 'ticketId', description: 'Ticket ID' })
  @ApiResponse({ status: 200, description: 'Comments retrieved successfully' })
  findByTicket(@Param('ticketId') ticketId: string) {
    return this.commentsService.findByTicket(ticketId);
  }
}
