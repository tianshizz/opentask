import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AttemptsService {
  constructor(private prisma: PrismaService) {}

  async create(ticketId: string, agentId: string, reasoning?: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    }

    // Get the next attempt number for this ticket
    const lastAttempt = await this.prisma.attempt.findFirst({
      where: { ticketId },
      orderBy: { attemptNumber: 'desc' },
    });
    const attemptNumber = (lastAttempt?.attemptNumber || 0) + 1;

    return this.prisma.attempt.create({
      data: {
        ticketId,
        agentId,
        attemptNumber,
        reasoning,
        status: 'RUNNING',
      },
      include: {
        agent: true,
        ticket: true,
      },
    });
  }

  async addStep(attemptId: string, action: string, input?: any, output?: any) {
    // Get the next step number
    const lastStep = await this.prisma.attemptStep.findFirst({
      where: { attemptId },
      orderBy: { stepNumber: 'desc' },
    });
    const stepNumber = (lastStep?.stepNumber || 0) + 1;

    return this.prisma.attemptStep.create({
      data: {
        attemptId,
        stepNumber,
        action,
        input: input || {},
        output: output || {},
        status: 'COMPLETED',
      },
    });
  }

  async complete(attemptId: string, outcome: string, status: 'SUCCESS' | 'FAILED' | 'PARTIAL') {
    return this.prisma.attempt.update({
      where: { id: attemptId },
      data: {
        status,
        outcome,
        completedAt: new Date(),
      },
      include: {
        steps: true,
        artifacts: true,
      },
    });
  }

  async findByTicket(ticketId: string) {
    return this.prisma.attempt.findMany({
      where: { ticketId },
      orderBy: { attemptNumber: 'desc' },
      include: {
        agent: true,
        steps: true,
        artifacts: true,
      },
    });
  }
}
