import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../database/prisma.service';
import { TicketStateMachine } from './ticket-state-machine.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { SearchTicketsDto } from './dto/search-tickets.dto';
import { CreateDependencyDto } from './dto/create-dependency.dto';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
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

  async search(searchDto: SearchTicketsDto) {
    const {
      q,
      status,
      priority,
      assignedTo,
      createdBy,
      tags,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = searchDto;

    const where: any = {};

    // Full-text search on title and description
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Status filter
    if (status && status.length > 0) {
      where.status = { in: status };
    }

    // Priority filter
    if (priority && priority.length > 0) {
      where.priority = { in: priority };
    }

    // Assigned agent filter
    if (assignedTo) {
      where.assignedAgentId = assignedTo;
    }

    // Creator filter
    if (createdBy) {
      where.createdById = createdBy;
    }

    // Tags filter
    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    const skip = (page - 1) * limit;

    // Execute search query
    const [tickets, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: Math.min(limit, 100), // Cap at 100 items per page
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          assignedAgent: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          _count: {
            select: {
              attempts: true,
              comments: true,
              subtasks: true,
            },
          },
        },
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return {
      data: tickets,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrevious: page > 1,
      },
      query: {
        q,
        status,
        priority,
        assignedTo,
        createdBy,
        tags,
        sortBy,
        sortOrder,
      },
    };
  }

  // ==================== Dependency Management ====================

  async createDependency(dto: CreateDependencyDto) {
    // Validate both tickets exist
    const [ticket, dependsOnTicket] = await Promise.all([
      this.prisma.ticket.findUnique({ where: { id: dto.ticketId } }),
      this.prisma.ticket.findUnique({ where: { id: dto.dependsOnTicketId } }),
    ]);

    if (!ticket) {
      throw new NotFoundException(`Ticket ${dto.ticketId} not found`);
    }
    if (!dependsOnTicket) {
      throw new NotFoundException(`Ticket ${dto.dependsOnTicketId} not found`);
    }

    // Check for circular dependencies
    const hasCircular = await this.checkCircularDependency(
      dto.ticketId,
      dto.dependsOnTicketId
    );
    if (hasCircular) {
      throw new BadRequestException('Circular dependency detected');
    }

    // Create dependency
    const dependency = await this.prisma.ticketDependency.create({
      data: {
        ticketId: dto.ticketId,
        dependsOnTicketId: dto.dependsOnTicketId,
        dependencyType: dto.dependencyType || 'blocks',
      },
      include: {
        ticket: true,
        dependsOnTicket: true,
      },
    });

    // Emit event
    this.eventEmitter.emit('dependency.created', { dependency });

    return dependency;
  }

  async getDependencies(ticketId: string) {
    const ticket = await this.findOne(ticketId);

    const [dependencies, dependedOnBy] = await Promise.all([
      this.prisma.ticketDependency.findMany({
        where: { ticketId },
        include: {
          dependsOnTicket: {
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
            },
          },
        },
      }),
      this.prisma.ticketDependency.findMany({
        where: { dependsOnTicketId: ticketId },
        include: {
          ticket: {
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
            },
          },
        },
      }),
    ]);

    return {
      dependencies, // Tickets this ticket depends on
      dependedOnBy, // Tickets that depend on this ticket
    };
  }

  async removeDependency(dependencyId: string) {
    const dependency = await this.prisma.ticketDependency.findUnique({
      where: { id: dependencyId },
    });

    if (!dependency) {
      throw new NotFoundException(`Dependency ${dependencyId} not found`);
    }

    await this.prisma.ticketDependency.delete({
      where: { id: dependencyId },
    });

    this.eventEmitter.emit('dependency.removed', { dependency });

    return { success: true, message: 'Dependency removed' };
  }

  private async checkCircularDependency(
    ticketId: string,
    dependsOnTicketId: string,
    visited: Set<string> = new Set()
  ): Promise<boolean> {
    if (ticketId === dependsOnTicketId) {
      return true;
    }

    if (visited.has(dependsOnTicketId)) {
      return false;
    }

    visited.add(dependsOnTicketId);

    const dependencies = await this.prisma.ticketDependency.findMany({
      where: { ticketId: dependsOnTicketId },
      select: { dependsOnTicketId: true },
    });

    for (const dep of dependencies) {
      if (await this.checkCircularDependency(ticketId, dep.dependsOnTicketId, visited)) {
        return true;
      }
    }

    return false;
  }

  // ==================== Subtask Management ====================

  async createSubtask(parentId: string, dto: CreateSubtaskDto, createdById: string) {
    // Validate parent ticket exists
    const parentTicket = await this.findOne(parentId);

    // Create subtask
    const subtask = await this.prisma.ticket.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority || 'MEDIUM',
        tags: dto.tags || [],
        assignedAgentId: dto.assignedAgentId,
        createdById,
        parentTicketId: parentId,
      },
      include: {
        createdBy: true,
        assignedAgent: true,
        parentTicket: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    // Emit event
    this.eventEmitter.emit('subtask.created', {
      subtask,
      parentId,
    });

    return subtask;
  }

  async getSubtasks(parentId: string) {
    const parent = await this.findOne(parentId);

    const subtasks = await this.prisma.ticket.findMany({
      where: { parentTicketId: parentId },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        assignedAgent: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        _count: {
          select: {
            attempts: true,
            comments: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Calculate progress
    const total = subtasks.length;
    const completed = subtasks.filter(
      (t) => t.status === TicketStatus.COMPLETED || t.status === TicketStatus.CLOSED
    ).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      parent: {
        id: parent.id,
        title: parent.title,
        status: parent.status,
      },
      subtasks,
      progress: {
        total,
        completed,
        percentage: progress,
      },
    };
  }

  async updateParentProgress(parentId: string) {
    const { subtasks, progress } = await this.getSubtasks(parentId);

    // If all subtasks are completed, mark parent as completed
    if (progress.total > 0 && progress.completed === progress.total) {
      const parent = await this.prisma.ticket.findUnique({
        where: { id: parentId },
      });

      if (parent && parent.status !== TicketStatus.COMPLETED) {
        await this.updateStatus(
          parentId,
          {
            status: TicketStatus.COMPLETED,
            reason: 'All subtasks completed',
          },
          parent.createdById
        );
      }
    }

    return progress;
  }
}
