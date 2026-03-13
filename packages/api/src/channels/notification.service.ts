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
import { NotificationConfig, ChannelNotificationConfig } from './notification-config.interface';
import { NotificationConfigService } from './notification-config.service';
import { EventType } from '../events/events.types';

/**
 * Notification Service
 * Unified notification service supporting multiple channels
 */
@Injectable()
export class NotificationService implements OnModuleInit {
  private logger = new Logger('NotificationService');
  private channels = new Map<ChannelType, IChannel>();

  constructor(
    private eventEmitter: EventEmitter2,
    private configService: NotificationConfigService,
  ) {}

  async onModuleInit() {
    this.logger.log('Notification Service initialized');
    // Load environment variable configurations
    this.configService.loadFromEnvironment();
  }

  /**
   * 注册 Channel
   */
  registerChannel(channel: IChannel) {
    this.channels.set(channel.type, channel);
    this.logger.log(`Registered channel: ${channel.name}`);
  }

  /**
   * 更新通知配置
   */
  updateNotificationConfig(eventType: string, config: NotificationConfig) {
    this.configService.updateConfig(eventType, config);
  }

  /**
   * 获取通知配置
   */
  getNotificationConfig(eventType: string) {
    return this.configService.getConfig(eventType);
  }

  /**
   * 启用/禁用特定事件的特定渠道
   */
  toggleChannel(eventType: string, channelType: string, enabled: boolean) {
    return this.configService.toggleChannel(eventType, channelType, enabled);
  }

  /**
   * 根据配置发送通知
   * 优先使用 ticket 的 channelId 和 channelType，如果指定了就只发送到那个 channel
   */
  private async sendConfiguredNotification(
    eventType: string,
    message: Message,
    payload?: any,
  ) {
    const config = this.configService.getConfig(eventType);
    
    if (!config || !config.enabled) {
      this.logger.debug(`Notification disabled for event: ${eventType}`);
      return [];
    }

    const results: SendResult[] = [];
    
    // Check if ticket specifies a specific channel
    const ticket = payload?.ticket;
    if (ticket?.channelId && ticket?.channelType) {
      // Only send to the specified channel
      const channelConfig = config.channels.find(c => c.type === ticket.channelType);
      
      if (!channelConfig) {
        this.logger.warn(
          `Channel ${ticket.channelType} specified in ticket but not configured for event: ${eventType}`
        );
        return [];
      }

      const adjustedMessage = this.adjustMessageForChannel(
        message,
        channelConfig,
        payload
      );

      try {
        const result = await this.sendNotification(
          channelConfig.type,
          adjustedMessage,
          ticket.channelId, // Use ticket's channelId as recipient
        );
        results.push(result);
        
        if (result.success) {
          this.logger.log(
            `Notification sent to ticket's channel ${channelConfig.type} (${ticket.channelId}) for event: ${eventType}`
          );
        } else {
          this.logger.error(
            `Failed to send notification to ${channelConfig.type}: ${result.error}`
          );
        }
      } catch (error) {
        this.logger.error(
          `Error sending notification to ${channelConfig.type}: ${error.message}`
        );
      }

      return results;
    }

    // Otherwise, send to all configured channels
    for (const channelConfig of config.channels) {
      // Check if payload has notification settings for this channel
      const channelKey = channelConfig.type.toLowerCase();
      const payloadChannelSettings = payload?.notificationSettings?.channels?.[channelKey];
      
      // Use payload settings to override config if provided
      const isEnabled = payloadChannelSettings?.enabled !== undefined 
        ? payloadChannelSettings.enabled 
        : channelConfig.enabled;
      
      if (!isEnabled) {
        continue;
      }

      // Use payload recipient if provided, otherwise use config recipient
      const recipient = payloadChannelSettings?.recipient || channelConfig.recipient;

      // Adjust message according to channel settings
      const adjustedMessage = this.adjustMessageForChannel(
        message, 
        channelConfig, 
        payload
      );

      try {
        const result = await this.sendNotification(
          channelConfig.type,
          adjustedMessage,
          recipient,
        );
        results.push(result);
        
        if (result.success) {
          this.logger.log(
            `Notification sent to ${channelConfig.type} (${recipient}) for event: ${eventType}`
          );
        } else {
          this.logger.error(
            `Failed to send notification to ${channelConfig.type}: ${result.error}`
          );
        }
      } catch (error) {
        this.logger.error(
          `Error sending notification to ${channelConfig.type}: ${error.message}`
        );
      }
    }

    return results;
  }

  /**
   * 根据渠道设置调整消息
   */
  private adjustMessageForChannel(
    message: Message,
    channelConfig: ChannelNotificationConfig,
    payload?: any,
  ): Message {
    const adjustedMessage = { ...message };

    // Adjust according to channel type
    switch (channelConfig.type) {
      case ChannelType.SLACK:
        if (channelConfig.settings?.slack?.mentionBot) {
          // Slack requires <@USER_ID> format for mentions, not @username
          // If botUserId is provided, use it; otherwise fall back to username (won't actually mention)
          const botUserId = channelConfig.settings.slack.botUserId;
          const botUsername = channelConfig.settings.slack.botUsername || '@openclaw-bot';
          
          const mention = botUserId ? `<@${botUserId}>` : botUsername;
          adjustedMessage.content = `${mention} ${message.content}`;
        }
        break;
      
      // Additional channel-specific adjustments can be added here
      default:
        break;
    }

    // Set priority
    if (channelConfig.priority) {
      adjustedMessage.priority = channelConfig.priority;
    }

    return adjustedMessage;
  }
  async sendNotification(
    channelType: ChannelType,
    message: Message,
    recipient: string,
  ): Promise<SendResult> {
    const channel = this.channels.get(channelType);
    
    if (!channel) {
      this.logger.warn(`Channel ${channelType} not found`);
      return { 
        success: false, 
        error: 'Channel not found',
        channelType,
        timestamp: new Date(),
      };
    }

    if (!channel.isConnected()) {
      this.logger.warn(`Channel ${channelType} is not connected`);
      return { 
        success: false, 
        error: 'Channel not connected',
        channelType,
        timestamp: new Date(),
      };
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

  // ============= Event listeners =============

  /**
   * Listen to Ticket Created event
   */
  @OnEvent(EventType.TICKET_CREATED)
  async handleTicketCreated(payload: any) {
    const message: CardMessage = {
      type: MessageType.CARD,
      title: '🎫 新的 Ticket 已创建',
      content: `**${payload.ticket.title}**\n${payload.ticket.description || ''}`,
      fields: [
        { name: 'ID', value: payload.ticketId, inline: true },
        { name: '优先级', value: payload.ticket.priority, inline: true },
        { name: 'Status', value: payload.ticket.status, inline: true },
        { name: '创建者', value: payload.createdBy, inline: true },
      ],
      color: '#10b981',
      priority: MessagePriority.MEDIUM,
    };

    // Send using configurable notifications
    await this.sendConfiguredNotification(
      EventType.TICKET_CREATED,
      message,
      payload,
    );
  }

  /**
   * Listen to Ticket Status Changed event
   */
  @OnEvent(EventType.TICKET_STATUS_CHANGED)
  async handleTicketStatusChanged(payload: any) {
    // Special handling: Send WAITING_REVIEW status to Slack #approvals
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

    // Send using configurable notifications
    await this.sendConfiguredNotification(
      EventType.TICKET_STATUS_CHANGED,
      message,
      payload,
    );
  }

  /**
   * Send approval request to Slack
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

    // Send to Slack #approvals channel
    await this.sendNotification(
      ChannelType.SLACK,
      message,
      '#approvals',
    );

    // Also send to WebUI
    await this.sendNotification(
      ChannelType.WEB_UI,
      message,
      `ticket:${payload.ticketId}`,
    );
  }

  /**
   * Listen to Attempt Complete event
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

    await this.sendConfiguredNotification(
      EventType.ATTEMPT_COMPLETED,
      message,
      payload,
    );
  }

  /**
   * Listen to Comment Created event
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

    await this.sendConfiguredNotification(
      EventType.COMMENT_CREATED,
      message,
      payload,
    );
  }

  // ============= Utility methods =============

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
