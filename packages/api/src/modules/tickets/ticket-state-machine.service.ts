import { Injectable, BadRequestException } from '@nestjs/common';
import { TicketStatus } from '@prisma/client';

@Injectable()
export class TicketStateMachine {
  private readonly transitions: Record<TicketStatus, TicketStatus[]> = {
    [TicketStatus.OPEN]: [TicketStatus.IN_PROGRESS, TicketStatus.CANCELLED],
    [TicketStatus.IN_PROGRESS]: [
      TicketStatus.WAITING_REVIEW,
      TicketStatus.BLOCKED,
      TicketStatus.CANCELLED,
    ],
    [TicketStatus.WAITING_REVIEW]: [
      TicketStatus.COMPLETED,
      TicketStatus.NEEDS_REVISION,
      TicketStatus.IN_PROGRESS,
    ],
    [TicketStatus.NEEDS_REVISION]: [TicketStatus.IN_PROGRESS, TicketStatus.CANCELLED],
    [TicketStatus.BLOCKED]: [TicketStatus.IN_PROGRESS, TicketStatus.CANCELLED],
    [TicketStatus.COMPLETED]: [TicketStatus.CLOSED, TicketStatus.NEEDS_REVISION],
    [TicketStatus.CLOSED]: [], // Terminal state
    [TicketStatus.CANCELLED]: [], // Terminal state
  };

  canTransition(from: TicketStatus, to: TicketStatus): boolean {
    return this.transitions[from]?.includes(to) ?? false;
  }

  validateTransition(from: TicketStatus, to: TicketStatus): void {
    if (!this.canTransition(from, to)) {
      throw new BadRequestException(
        `Invalid status transition from ${from} to ${to}. ` +
          `Allowed transitions: ${this.transitions[from]?.join(', ') || 'none'}`
      );
    }
  }

  getAllowedTransitions(from: TicketStatus): TicketStatus[] {
    return this.transitions[from] || [];
  }
}
