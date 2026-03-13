import { ChannelType, MessagePriority } from './channel.interface';

/**
 * Notification configuration interface
 */
export interface NotificationConfig {
  // Whether notifications are enabled
  enabled: boolean;
  
  // Event type
  eventType: string;
  
  // Target channel configuration
  channels: ChannelNotificationConfig[];
}

/**
 * 单个渠道的通知配置
 */
export interface ChannelNotificationConfig {
  // 渠道类型
  type: ChannelType;
  
  // 是否启用此渠道
  enabled: boolean;
  
  // 目标接收者（频道、用户ID等）
  recipient: string;
  
  // 消息优先级
  priority?: MessagePriority;
  
  // 渠道特定配置
  settings?: ChannelSpecificSettings;
}

/**
 * 渠道特定设置
 */
export interface ChannelSpecificSettings {
  // Slack 特定设置
  slack?: SlackNotificationSettings;
  
  // Discord 特定设置
  discord?: DiscordNotificationSettings;
  
  // 其他渠道设置可以在这里添加
}

/**
 * Slack 通知设置
 */
export interface SlackNotificationSettings {
  // 是否 @bot
  mentionBot?: boolean;
  
  // Bot User ID (required for actual @mentions, format: U01234ABCDE)
  botUserId?: string;
  
  // Bot 用户名（如果不 @bot，可以指定特定用户）
  botUsername?: string;
  
  // 是否使用线程回复
  threadReply?: boolean;
  
  // 自定义消息模板
  messageTemplate?: string;
}

/**
 * Discord 通知设置
 */
export interface DiscordNotificationSettings {
  // 是否 @bot 或 @特定角色
  mentionRole?: string;
  
  // 是否使用线程回复
  threadReply?: boolean;
  
  // 自定义消息模板
  messageTemplate?: string;
}

/**
 * 默认通知配置
 */
export const DEFAULT_NOTIFICATION_CONFIG: Record<string, NotificationConfig> = {
  'ticket.created': {
    enabled: true,
    eventType: 'ticket.created',
    channels: [
      {
        type: ChannelType.WEB_UI,
        enabled: true,
        recipient: 'broadcast',
        priority: MessagePriority.MEDIUM,
      },
      {
        type: ChannelType.SLACK,
        enabled: false, // 默认关闭，需要配置
        recipient: '#notifications',
        priority: MessagePriority.MEDIUM,
        settings: {
          slack: {
            mentionBot: true,
            // To actually mention a user, provide botUserId (e.g., 'U01234ABCDE')
            botUserId: 'U0AGEE1JD3P',
            botUsername: '@openclaw-bot', // Fallback if botUserId not provided
          },
        },
      },
    ],
  },
  'ticket.status.changed': {
    enabled: true,
    eventType: 'ticket.status.changed',
    channels: [
      {
        type: ChannelType.WEB_UI,
        enabled: true,
        recipient: 'broadcast',
        priority: MessagePriority.HIGH,
      },
      {
        type: ChannelType.SLACK,
        enabled: false, // 默认关闭，需要配置
        recipient: '#general',
        priority: MessagePriority.HIGH,
        settings: {
          slack: {
            mentionBot: true,
            botUserId: 'U0AGEE1JD3P',
            botUsername: '@openclaw-bot',
          },
        },
      },
    ],
  },
  'attempt.completed': {
    enabled: true,
    eventType: 'attempt.completed',
    channels: [
      {
        type: ChannelType.WEB_UI,
        enabled: true,
        recipient: 'broadcast',
        priority: MessagePriority.MEDIUM,
      },
      {
        type: ChannelType.SLACK,
        enabled: false, // 默认关闭，需要配置
        recipient: '#general',
        priority: MessagePriority.MEDIUM,
        settings: {
          slack: {
            mentionBot: true,
            botUserId: 'U0AGEE1JD3P',
            botUsername: '@openclaw-bot',
          },
        },
      },
    ],
  },
  'comment.created': {
    enabled: true,
    eventType: 'comment.created',
    channels: [
      {
        type: ChannelType.WEB_UI,
        enabled: true,
        recipient: 'broadcast',
        priority: MessagePriority.LOW,
      },
      {
        type: ChannelType.SLACK,
        enabled: false, // 默认关闭，需要配置
        recipient: '#general',
        priority: MessagePriority.LOW,
        settings: {
          slack: {
            mentionBot: true,
            botUserId: 'U0AGEE1JD3P',
            botUsername: '@openclaw-bot',
          },
        },
      },
    ],
  },
};
