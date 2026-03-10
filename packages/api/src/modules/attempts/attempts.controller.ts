import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AttemptsService } from './attempts.service';
import { CreateAttemptDto, AddStepDto, CompleteAttemptDto } from './dto';

@ApiTags('attempts')
@Controller('attempts')
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create a new attempt',
    description: 'Create a new execution attempt for a ticket by an agent'
  })
  @ApiResponse({ status: 201, description: 'Attempt created successfully' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  create(@Body() createAttemptDto: CreateAttemptDto) {
    return this.attemptsService.create(
      createAttemptDto.ticketId,
      createAttemptDto.agentId,
      createAttemptDto.reasoning
    );
  }

  @Post(':id/steps')
  @ApiOperation({ 
    summary: 'Add a step to attempt',
    description: 'Record a new step in the attempt execution'
  })
  @ApiParam({ name: 'id', description: 'Attempt ID' })
  @ApiResponse({ status: 201, description: 'Step added successfully' })
  addStep(
    @Param('id') attemptId: string,
    @Body() addStepDto: AddStepDto
  ) {
    return this.attemptsService.addStep(
      attemptId,
      addStepDto.action,
      addStepDto.input,
      addStepDto.output
    );
  }

  @Post(':id/complete')
  @ApiOperation({ 
    summary: 'Complete an attempt',
    description: 'Mark an attempt as completed with final status and outcome'
  })
  @ApiParam({ name: 'id', description: 'Attempt ID' })
  @ApiResponse({ status: 200, description: 'Attempt completed successfully' })
  complete(
    @Param('id') attemptId: string,
    @Body() completeAttemptDto: CompleteAttemptDto
  ) {
    return this.attemptsService.complete(
      attemptId,
      completeAttemptDto.outcome,
      completeAttemptDto.status
    );
  }

  @Get('ticket/:ticketId')
  @ApiOperation({ 
    summary: 'Get all attempts for a ticket',
    description: 'Retrieve all execution attempts for a specific ticket'
  })
  @ApiParam({ name: 'ticketId', description: 'Ticket ID' })
  @ApiResponse({ status: 200, description: 'Attempts retrieved successfully' })
  findByTicket(@Param('ticketId') ticketId: string) {
    return this.attemptsService.findByTicket(ticketId);
  }
}
