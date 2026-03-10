import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../database/prisma.service';
import { TicketStateMachine } from './ticket-state-machine.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { TicketStatus, CommentType } from '@prisma/client';
import { EventType } from '../../events/events.types';

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private stateMachine: TicketStateMachine,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateTicketDto, createdById: string) {
    return this.prisma.ticket.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority || 'MEDIUM',
        tags: dto.tags || [],
        agentMetadata: dto.agentMetadata || {},
        assignedAgentId: dto.assignedAgentId,
        createdById,
      },
      include: {
        createdBy: true,
        assignedAgent: true,
      },
    });
  }

  async findAll(query: {
    status?: TicketStatus;
    priority?: string;
    assignedAgentId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.assignedAgentId) where.assignedAgentId = query.assignedAgentId;

    const [data, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: true,
          assignedAgent: true,
          _count: {
            select: {
              attempts: true,
              comments: true,
            },
          },
        },
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrevious: page > 1,
      },
    };
  }

  async findOne(id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        createdBy: true,
        assignedAgent: true,
        attempts: {
          orderBy: { attemptNumber: 'desc' },
          include: {
            agent: true,
            _count: {
              select: {
                steps: true,
                artifacts: true,
              },
            },
          },
        },
        comments: {
          orderBy: { createdAt: 'desc' },
          include: {
            author: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    return ticket;
  }

  async updateStatus(id: string, dto: UpdateTicketStatusDto, actorId: string) {
    const ticket = await this.findOne(id);

    // Validate state transition
    this.stateMachine.validateTransition(ticket.status, dto.status);

    // Update ticket status
    const updated = await this.prisma.ticket.update({
      where: { id },
      data: {
        status: dto.status,
        startedAt: dto.status === TicketStatus.IN_PROGRESS && !ticket.startedAt 
          ? new Date() 
          : ticket.startedAt,
        completedAt: dto.status === TicketStatus.COMPLETED 
          ? new Date() 
          : ticket.completedAt,
        closedAt: dto.status === TicketStatus.CLOSED 
          ? new Date() 
          : ticket.closedAt,
      },
      include: {
        createdBy: true,
        assignedAgent: true,
      },
    });

    // Add status change comment
    await this.prisma.comment.create({
      data: {
        ticketId: id,
        authorId: actorId,
        commentType: CommentType.STATUS_CHANGE,
        content: `Status changed: ${ticket.status} → ${dto.status}${
          dto.reason ? `\nReason: ${dto.reason}` : ''
        }`,
      },
    });

    // Emit status changed event
    this.eventEmitter.emit(EventType.TICKET_STATUS_CHANGED, {
      ticketId: id,
      ticket: updated,
      oldStatus: ticket.status,
      newStatus: dto.status,
      reason: dto.reason,
      actorId,
    });

    return updated;
  }

  async requestReview(id: string, message: string, actorId: string) {
    const ticket = await this.findOne(id);

    // Update to WAITING_REVIEW status
    const updated = await this.updateStatus(
      id,
      { status: TicketStatus.WAITING_REVIEW, reason: 'Agent requested review' },
      actorId
    );

    // Add review request comment
    await this.prisma.comment.create({
      data: {
        ticketId: id,
        authorId: actorId,
        commentType: CommentType.AGENT_UPDATE,
        content: message,
      },
    });

    return updated;
  }

  async approve(id: string, message: string, actorId: string) {
    const updated = await this.updateStatus(
      id,
      { status: TicketStatus.COMPLETED, reason: 'Approved by human reviewer' },
      actorId
    );

    await this.prisma.comment.create({
      data: {
        ticketId: id,
        authorId: actorId,
        commentType: CommentType.HUMAN_FEEDBACK,
        content: message || 'Approved',
      },
    });

    return updated;
  }

  async requestRevision(id: string, message: string, actorId: string) {
    const updated = await this.updateStatus(
      id,
      { status: TicketStatus.NEEDS_REVISION, reason: 'Revision requested' },
      actorId
    );

    await this.prisma.comment.create({
      data: {
        ticketId: id,
        authorId: actorId,
        commentType: CommentType.HUMAN_FEEDBACK,
        content: message,
      },
    });

    return updated;
  }
}
