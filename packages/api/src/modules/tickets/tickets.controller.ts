import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import {
  CreateTicketDto,
  UpdateTicketStatusDto,
  RequestReviewDto,
  ApproveTicketDto,
  RequestRevisionDto,
  QueryTicketsDto,
  SearchTicketsDto,
  CreateDependencyDto,
  CreateSubtaskDto,
} from './dto';

@ApiTags('tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new ticket' })
  @ApiResponse({ status: 201, description: 'Ticket created successfully' })
  create(@Body() createTicketDto: CreateTicketDto) {
    // TODO: Get actorId from authentication context
    const actorId = '00000000-0000-0000-0000-000000000001'; // System actor for now
    return this.ticketsService.create(createTicketDto, actorId);
  }

  @Get('search')
  @ApiOperation({ 
    summary: 'Search tickets',
    description: 'Advanced search with full-text query and multiple filters'
  })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  search(@Query() searchDto: SearchTicketsDto) {
    return this.ticketsService.search(searchDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'List all tickets',
    description: 'Retrieve a paginated list of tickets with optional filters'
  })
  @ApiResponse({ status: 200, description: 'Tickets retrieved successfully' })
  findAll(@Query() query: QueryTicketsDto) {
    return this.ticketsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ticket details' })
  @ApiResponse({ status: 200, description: 'Ticket found' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update ticket status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateTicketStatusDto) {
    // TODO: Get actorId from authentication
    const actorId = '00000000-0000-0000-0000-000000000001';
    return this.ticketsService.updateStatus(id, dto, actorId);
  }

  @Post(':id/request-review')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Request human review',
    description: 'Request a human to review the ticket progress'
  })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiResponse({ status: 200, description: 'Review requested successfully' })
  requestReview(@Param('id') id: string, @Body() dto: RequestReviewDto) {
    const actorId = '00000000-0000-0000-0000-000000000001';
    return this.ticketsService.requestReview(id, dto.message || '', actorId);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Approve ticket completion',
    description: 'Approve the completed work on a ticket'
  })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiResponse({ status: 200, description: 'Ticket approved successfully' })
  approve(@Param('id') id: string, @Body() dto: ApproveTicketDto) {
    const actorId = '00000000-0000-0000-0000-000000000001';
    return this.ticketsService.approve(id, dto.message || 'Approved', actorId);
  }

  @Post(':id/request-revision')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Request revision',
    description: 'Request changes to be made to the ticket'
  })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiResponse({ status: 200, description: 'Revision requested successfully' })
  requestRevision(@Param('id') id: string, @Body() dto: RequestRevisionDto) {
    const actorId = '00000000-0000-0000-0000-000000000001';
    return this.ticketsService.requestRevision(id, dto.message, actorId);
  }

  // ==================== Dependencies ====================

  @Post('dependencies')
  @ApiOperation({ 
    summary: 'Create a dependency between tickets',
    description: 'Create a dependency relationship where one ticket depends on another'
  })
  @ApiResponse({ status: 201, description: 'Dependency created successfully' })
  @ApiResponse({ status: 400, description: 'Circular dependency detected' })
  createDependency(@Body() dto: CreateDependencyDto) {
    return this.ticketsService.createDependency(dto);
  }

  @Get(':id/dependencies')
  @ApiOperation({ 
    summary: 'Get ticket dependencies',
    description: 'Get all dependencies for a ticket (both depends on and depended by)'
  })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiResponse({ status: 200, description: 'Dependencies retrieved successfully' })
  getDependencies(@Param('id') id: string) {
    return this.ticketsService.getDependencies(id);
  }

  @Delete('dependencies/:dependencyId')
  @ApiOperation({ 
    summary: 'Remove a dependency',
    description: 'Remove a dependency relationship between tickets'
  })
  @ApiParam({ name: 'dependencyId', description: 'Dependency ID' })
  @ApiResponse({ status: 200, description: 'Dependency removed successfully' })
  removeDependency(@Param('dependencyId') dependencyId: string) {
    return this.ticketsService.removeDependency(dependencyId);
  }

  // ==================== Subtasks ====================

  @Post(':id/subtasks')
  @ApiOperation({ 
    summary: 'Create a subtask',
    description: 'Create a subtask under a parent ticket'
  })
  @ApiParam({ name: 'id', description: 'Parent ticket ID' })
  @ApiResponse({ status: 201, description: 'Subtask created successfully' })
  createSubtask(
    @Param('id') parentId: string,
    @Body() dto: CreateSubtaskDto
  ) {
    const actorId = '00000000-0000-0000-0000-000000000001';
    return this.ticketsService.createSubtask(parentId, dto, actorId);
  }

  @Get(':id/subtasks')
  @ApiOperation({ 
    summary: 'Get subtasks',
    description: 'Get all subtasks of a parent ticket with progress information'
  })
  @ApiParam({ name: 'id', description: 'Parent ticket ID' })
  @ApiResponse({ status: 200, description: 'Subtasks retrieved successfully' })
  getSubtasks(@Param('id') parentId: string) {
    return this.ticketsService.getSubtasks(parentId);
  }

  @Post(':id/subtasks/update-progress')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Update parent ticket progress',
    description: 'Recalculate and update parent ticket progress based on subtask completion'
  })
  @ApiParam({ name: 'id', description: 'Parent ticket ID' })
  @ApiResponse({ status: 200, description: 'Progress updated successfully' })
  updateParentProgress(@Param('id') parentId: string) {
    return this.ticketsService.updateParentProgress(parentId);
  }
}
