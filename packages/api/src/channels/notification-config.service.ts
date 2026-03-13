import { Injectable, Logger } from '@nestjs/common';
import { NotificationConfig } from './notification-config.interface';
import { DEFAULT_NOTIFICATION_CONFIG } from './notification-config.interface';

/**
 * 通知配置管理服务
 * 
 * 这个服务负责管理通知配置，可以从数据库、环境变量或配置文件中加载配置
 */
@Injectable()
export class NotificationConfigService {
  private logger = new Logger('NotificationConfigService');
  private configs: Map<string, NotificationConfig> = new Map();

  constructor() {
    this.loadDefaultConfigs();
  }

  /**
   * 加载默认配置
   */
  private loadDefaultConfigs() {
    Object.entries(DEFAULT_NOTIFICATION_CONFIG).forEach(([eventType, config]) => {
      this.configs.set(eventType, config);
    });
    this.logger.log(`Loaded ${this.configs.size} default notification configs`);
  }

  /**
   * 获取事件的通知配置
   */
  getConfig(eventType: string): NotificationConfig | null {
    return this.configs.get(eventType) || null;
  }

  /**
   * 更新通知配置
   */
  updateConfig(eventType: string, config: NotificationConfig) {
    this.configs.set(eventType, config);
    this.logger.log(`Updated notification config for event: ${eventType}`);
  }

  /**
   * 删除通知配置
   */
  removeConfig(eventType: string) {
    const deleted = this.configs.delete(eventType);
    if (deleted) {
      this.logger.log(`Removed notification config for event: ${eventType}`);
    }
    return deleted;
  }

  /**
   * 获取所有配置
   */
  getAllConfigs(): Record<string, NotificationConfig> {
    const result: Record<string, NotificationConfig> = {};
    this.configs.forEach((config, eventType) => {
      result[eventType] = config;
    });
    return result;
  }

  /**
   * 从环境变量加载配置
   * 
   * 示例环境变量：
   * NOTIFICATION_TICKET_CREATED_SLACK_ENABLED=true
   * NOTIFICATION_TICKET_CREATED_SLACK_RECIPIENT=#general
   * NOTIFICATION_TICKET_CREATED_SLACK_MENTION_BOT=true
   */
  loadFromEnvironment() {
    // Ticket 创建配置
    if (process.env.NOTIFICATION_TICKET_CREATED_SLACK_ENABLED === 'true') {
      const existingConfig = this.getConfig('ticket.created') || {
        enabled: true,
        eventType: 'ticket.created',
        channels: [],
      };

      const slackChannel = existingConfig.channels.find(c => c.type === 'SLACK');
      if (slackChannel) {
        slackChannel.enabled = true;
        slackChannel.recipient = process.env.NOTIFICATION_TICKET_CREATED_SLACK_RECIPIENT || '#general';
        
        if (process.env.NOTIFICATION_TICKET_CREATED_SLACK_MENTION_BOT === 'true') {
          slackChannel.settings = {
            slack: {
              mentionBot: true,
              botUserId: process.env.NOTIFICATION_TICKET_CREATED_SLACK_BOT_USER_ID,
              botUsername: process.env.NOTIFICATION_TICKET_CREATED_SLACK_BOT_USERNAME || '@openclaw-bot',
            },
          };
        }
      }

      this.updateConfig('ticket.created', existingConfig);
    }

    this.logger.log('Loaded notification configs from environment variables');
  }

  /**
   * 启用/禁用特定事件的特定渠道
   */
  toggleChannel(eventType: string, channelType: string, enabled: boolean) {
    const config = this.getConfig(eventType);
    if (!config) {
      this.logger.warn(`Config not found for event: ${eventType}`);
      return false;
    }

    const channel = config.channels.find(c => c.type === channelType);
    if (!channel) {
      this.logger.warn(`Channel ${channelType} not found in config for event: ${eventType}`);
      return false;
    }

    channel.enabled = enabled;
    this.updateConfig(eventType, config);
    
    this.logger.log(
      `${enabled ? 'Enabled' : 'Disabled'} ${channelType} for event: ${eventType}`
    );
    return true;
  }

  /**
   * 批量更新配置
   */
  batchUpdateConfigs(configs: Record<string, NotificationConfig>) {
    Object.entries(configs).forEach(([eventType, config]) => {
      this.updateConfig(eventType, config);
    });
    this.logger.log(`Batch updated ${Object.keys(configs).length} notification configs`);
  }
}
