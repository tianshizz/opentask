// 事件类型定义
export enum EventType {
  // Ticket 事件
  TICKET_CREATED = 'ticket.created',
  TICKET_UPDATED = 'ticket.updated',
  TICKET_STATUS_CHANGED = 'ticket.status.changed',
  TICKET_ASSIGNED = 'ticket.assigned',
  
  // Attempt 事件
  ATTEMPT_CREATED = 'attempt.created',
  ATTEMPT_UPDATED = 'attempt.updated',
  ATTEMPT_COMPLETED = 'attempt.completed',
  ATTEMPT_STEP_ADDED = 'attempt.step.added',
  
  // Comment 事件
  COMMENT_CREATED = 'comment.created',
  
  // 通知事件
  NOTIFICATION_SENT = 'notification.sent',
}

// 事件数据Interface
export interface TicketCreatedEvent {
  ticketId: string;
  ticket: any;
  createdBy: string;
}

export interface TicketUpdatedEvent {
  ticketId: string;
  ticket: any;
  changes: Record<string, any>;
  updatedBy: string;
}

export interface TicketStatusChangedEvent {
  ticketId: string;
  oldStatus: string;
  newStatus: string;
  changedBy: string;
  ticket: any;
}

export interface AttemptCreatedEvent {
  attemptId: string;
  ticketId: string;
  attempt: any;
  agentId: string;
}

export interface AttemptUpdatedEvent {
  attemptId: string;
  ticketId: string;
  attempt: any;
}

export interface AttemptCompletedEvent {
  attemptId: string;
  ticketId: string;
  attempt: any;
  status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
}

export interface AttemptStepAddedEvent {
  stepId: string;
  attemptId: string;
  ticketId: string;
  step: any;
}

export interface CommentCreatedEvent {
  commentId: string;
  ticketId: string;
  comment: any;
  authorId: string;
}
