import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import {
  IChannel,
  ChannelType,
  Message,
  MessageType,
  MessagePriority,
  CardMessage,
  NotificationMessage,
  SendResult,
} from './channel.interface';
import { EventType } from '../events/events.types';

/**
 * Notification Service
 * 统一的通知Service，支持多渠道
 */
@Injectable()
export class NotificationService implements OnModuleInit {
  private logger = new Logger('NotificationService');
  private channels = new Map<ChannelType, IChannel>();

  constructor(private eventEmitter: EventEmitter2) {}

  async onModuleInit() {
    this.logger.log('Notification Service initialized');
  }

  /**
   * 注册 Channel
   */
  registerChannel(channel: IChannel) {
    this.channels.set(channel.type, channel);
    this.logger.log(`Registered channel: ${channel.name}`);
  }

  /**
   * 发送通知到指定渠道
   */
  async sendNotification(
    channelType: ChannelType,
    message: Message,
    recipient: string,
  ) {
    const channel = this.channels.get(channelType);
    
    if (!channel) {
      this.logger.warn(`Channel ${channelType} not found`);
      return { success: false, error: 'Channel not found' };
    }

    if (!channel.isConnected()) {
      this.logger.warn(`Channel ${channelType} is not connected`);
      return { success: false, error: 'Channel not connected' };
    }

    return channel.sendMessage(message, recipient);
  }

  /**
   * 发送通知到All激活的渠道
   */
  async broadcastNotification(message: Message, recipient: string) {
    const results: SendResult[] = [];
    
    for (const [type, channel] of this.channels) {
      if (channel.isConnected()) {
        const result = await channel.sendMessage(message, recipient);
        results.push(result);
      }
    }
    
    return results;
  }

  /**
   * 发送通知到多个渠道
   */
  async sendToMultipleChannels(
    channelTypes: ChannelType[],
    message: Message,
    recipient: string,
  ) {
    const results: Array<SendResult | { success: boolean; error: string }> = [];
    
    for (const type of channelTypes) {
      const result = await this.sendNotification(type, message, recipient);
      results.push(result);
    }
    
    return results;
  }

  /**
   * 获取All Channel 的健康Status
   */
  async getChannelsHealth() {
    const health = {};
    
    for (const [type, channel] of this.channels) {
      health[type] = {
        name: channel.name,
        connected: channel.isConnected(),
        healthy: await channel.healthCheck(),
      };
    }
    
    return health;
  }

  // ============= 事件监听器 =============

  /**
   * 监听 Ticket 创建事件
   */
  @OnEvent(EventType.TICKET_CREATED)
  async handleTicketCreated(payload: any) {
    const message: CardMessage = {
      type: MessageType.CARD,
      title: '🎫 新的 Ticket 已创建',
      content: `**${payload.ticket.title}**\n${payload.ticket.description}`,
      fields: [
        { name: 'ID', value: payload.ticketId, inline: true },
        { name: '优先级', value: payload.ticket.priority, inline: true },
        { name: 'Status', value: payload.ticket.status, inline: true },
      ],
      color: '#10b981',
      priority: MessagePriority.MEDIUM,
    };

    // 发送到 WebUI
    await this.sendNotification(
      ChannelType.WEB_UI,
      message,
      'broadcast',
    );
  }

  /**
   * 监听 Ticket Status变更事件
   */
  @OnEvent(EventType.TICKET_STATUS_CHANGED)
  async handleTicketStatusChanged(payload: any) {
    // 特殊处理：WAITING_REVIEW Status发送到 Slack #approvals
    if (payload.newStatus === 'WAITING_REVIEW') {
      await this.sendApprovalRequest(payload);
      return;
    }

    const message: CardMessage = {
      type: MessageType.CARD,
      title: '📊 Ticket Status已Update',
      content: `Ticket **${payload.ticketId}** Status变更`,
      fields: [
        { name: '原Status', value: payload.oldStatus, inline: true },
        { name: '新Status', value: payload.newStatus, inline: true },
      ],
      color: this.getStatusColor(payload.newStatus),
      priority: MessagePriority.HIGH,
    };

    // 发送到 WebUI 和其他渠道
    await this.sendNotification(
      ChannelType.WEB_UI,
      message,
      `ticket:${payload.ticketId}`,
    );
  }

  /**
   * 发送审批请求到 Slack
   */
  private async sendApprovalRequest(payload: any) {
    const ticket = payload.ticket;
    
    const message: CardMessage = {
      type: MessageType.CARD,
      title: '🔔 需要审批',
      content: `**${ticket.title}**\n${ticket.description || ''}`,
      fields: [
        { name: 'Ticket ID', value: payload.ticketId, inline: true },
        { name: '优先级', value: ticket.priority, inline: true },
        { name: '创建时间', value: new Date(ticket.createdAt).toLocaleString(), inline: true },
      ],
      actions: [
        {
          id: `approve_${payload.ticketId}`,
          type: 'BUTTON',
          label: '✅ 批准',
          value: `approve:${payload.ticketId}`,
          style: 'PRIMARY',
        },
        {
          id: `reject_${payload.ticketId}`,
          type: 'BUTTON',
          label: '❌ 拒绝',
          value: `reject:${payload.ticketId}`,
          style: 'DANGER',
        },
      ],
      color: '#f59e0b',
      priority: MessagePriority.HIGH,
      metadata: {
        ticketId: payload.ticketId,
        requiresApproval: true,
      },
    };

    // 发送到 Slack #approvals 频道
    await this.sendNotification(
      ChannelType.SLACK,
      message,
      '#approvals',
    );

    // 同时发送到 WebUI
    await this.sendNotification(
      ChannelType.WEB_UI,
      message,
      `ticket:${payload.ticketId}`,
    );
  }

  /**
   * 监听 Attempt Complete事件
   */
  @OnEvent(EventType.ATTEMPT_COMPLETED)
  async handleAttemptCompleted(payload: any) {
    const isSuccess = payload.status === 'SUCCESS';
    
    const message: CardMessage = {
      type: MessageType.CARD,
      title: isSuccess ? '✅ Attempt Complete' : '❌ Attempt Failed',
      content: `Attempt **${payload.attemptId}** 已${isSuccess ? 'Success' : 'Failed'}Complete`,
      fields: [
        { name: 'Ticket ID', value: payload.ticketId, inline: true },
        { name: 'Status', value: payload.status, inline: true },
      ],
      color: isSuccess ? '#10b981' : '#ef4444',
      priority: isSuccess ? MessagePriority.MEDIUM : MessagePriority.HIGH,
    };

    await this.sendNotification(
      ChannelType.WEB_UI,
      message,
      `ticket:${payload.ticketId}`,
    );
  }

  /**
   * 监听评论创建事件
   */
  @OnEvent(EventType.COMMENT_CREATED)
  async handleCommentCreated(payload: any) {
    const message: NotificationMessage = {
      type: MessageType.NOTIFICATION,
      title: '💬 新评论',
      content: `有新的评论在 Ticket ${payload.ticketId}`,
      ticketId: payload.ticketId,
      priority: MessagePriority.LOW,
    };

    await this.sendNotification(
      ChannelType.WEB_UI,
      message,
      `ticket:${payload.ticketId}`,
    );
  }

  // ============= 工具方法 =============

  private getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      OPEN: '#3b82f6',
      IN_PROGRESS: '#f59e0b',
      BLOCKED: '#ef4444',
      WAITING_REVIEW: '#8b5cf6',
      NEEDS_REVISION: '#f97316',
      COMPLETED: '#10b981',
      CLOSED: '#6b7280',
      CANCELLED: '#6b7280',
    };
    return colorMap[status] || '#3b82f6';
  }

  /**
   * 创建简单文本通知
   */
  createTextNotification(
    title: string,
    content: string,
    priority: MessagePriority = MessagePriority.MEDIUM,
  ): Message {
    return {
      type: MessageType.TEXT,
      title,
      content,
      priority,
    };
  }

  /**
   * 创建卡片通知
   */
  createCardNotification(
    title: string,
    content: string,
    fields: Array<{ name: string; value: string; inline?: boolean }>,
    color: string = '#3b82f6',
  ): CardMessage {
    return {
      type: MessageType.CARD,
      title,
      content,
      fields,
      color,
      priority: MessagePriority.MEDIUM,
    };
  }
}
