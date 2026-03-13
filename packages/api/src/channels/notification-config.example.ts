import { NotificationConfig } from './notification-config.interface';
import { ChannelType, MessagePriority } from './channel.interface';

/**
 * 示例通知配置
 * 
 * 这个文件展示了如何配置不同事件的通知发送规则
 * 
 * 使用方法：
 * 1. 复制这个文件为 notification-config.ts
 * 2. 根据需要修改配置
 * 3. 在你的模块中导入并应用配置
 */
export const EXAMPLE_NOTIFICATION_CONFIGS: Record<string, NotificationConfig> = {
  // Ticket 创建事件配置
  'ticket.created': {
    enabled: true,
    eventType: 'ticket.created',
    channels: [
      // 发送到 WebUI (默认启用)
      {
        type: ChannelType.WEB_UI,
        enabled: true,
        recipient: 'broadcast',
        priority: MessagePriority.MEDIUM,
      },
      // 发送到 Slack (需要配置)
      {
        type: ChannelType.SLACK,
        enabled: true, // 设置为 true 启用
        recipient: '#general', // Slack 频道名称
        priority: MessagePriority.MEDIUM,
        settings: {
          slack: {
            mentionBot: true, // 启用 @mention
            // 重要：提供 Slack User ID 才能真正 @mention
            // 获取方式：在 Slack 中点击用户 → View profile → More → Copy member ID
            botUserId: 'U01234ABCDE', // 替换为实际的 Slack User ID
            botUsername: '@openclaw-bot', // 如果没有 botUserId，显示此文本（不会触发通知）
            threadReply: false, // 是否使用线程回复
          },
        },
      },
      // 发送到 Discord (可选)
      {
        type: ChannelType.DISCORD,
        enabled: false, // 默认关闭
        recipient: '#tickets', // Discord 频道
        priority: MessagePriority.MEDIUM,
        settings: {
          discord: {
            mentionRole: '@here', // 提及角色
            threadReply: false,
          },
        },
      },
    ],
  },

  // Ticket 状态变更事件配置
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
      // 状态变更时也发送到 Slack
      {
        type: ChannelType.SLACK,
        enabled: true,
        recipient: '#ticket-updates',
        priority: MessagePriority.HIGH,
        settings: {
          slack: {
            mentionBot: true,
            botUsername: '@opentask-bot',
          },
        },
      },
    ],
  },

  // Ticket 审批请求配置
  'ticket.waiting_review': {
    enabled: true,
    eventType: 'ticket.waiting_review',
    channels: [
      {
        type: ChannelType.WEB_UI,
        enabled: true,
        recipient: 'broadcast',
        priority: MessagePriority.HIGH,
      },
      // 审批请求发送到专门的审批频道
      {
        type: ChannelType.SLACK,
        enabled: true,
        recipient: '#approvals',
        priority: MessagePriority.URGENT,
        settings: {
          slack: {
            mentionBot: true,
            botUsername: '@approval-bot',
            threadReply: true, // 审批请求使用线程回复
          },
        },
      },
    ],
  },
};

/**
 * 如何使用这些配置的示例：
 * 
 * ```typescript
 * import { NotificationService } from './channels/notification.service';
 * import { EXAMPLE_NOTIFICATION_CONFIGS } from './channels/notification-config.example';
 * 
 * // 在你的模块或服务中
 * constructor(private notificationService: NotificationService) {}
 * 
 * // 应用配置
 * onModuleInit() {
 *   Object.entries(EXAMPLE_NOTIFICATION_CONFIGS).forEach(([eventType, config]) => {
 *     this.notificationService.updateNotificationConfig(eventType, config);
 *   });
 * }
 * ```
 */
