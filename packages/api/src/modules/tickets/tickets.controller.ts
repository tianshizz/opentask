import {
  Controller,
  Get,
  Post,
  Patch,
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
}
