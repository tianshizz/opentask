import { Injectable, Logger } from '@nestjs/common';
import { WebClient } from '@slack/web-api';
import { ChannelProvider } from '../channel.provider';
import {
  ChannelType,
  Message,
  MessageType,
  CardMessage,
  InteractiveMessage,
  Action,
} from '../channel.interface';

/**
 * Slack Channel
 * 通过 Slack Web API 发送消息
 */
@Injectable()
export class SlackChannel extends ChannelProvider {
  private client: WebClient | null = null;

  constructor() {
    super(ChannelType.SLACK, 'Slack');
  }

  protected async connect(): Promise<void> {
    const token = this.config.settings.botToken;
    
    if (!token) {
      throw new Error('Slack bot token is required');
    }

    this.client = new WebClient(token);
    
    // Test连接
    try {
      const auth = await this.client.auth.test();
      this.logger.log(`Connected to Slack workspace: ${auth.team}`);
    } catch (error) {
      throw new Error(`Failed to connect to Slack: ${error.message}`);
    }
  }

  protected async onDisconnect(): Promise<void> {
    this.client = null;
    this.logger.log('Slack client disconnected');
  }

  protected async send(message: any, recipient: string): Promise<string> {
    if (!this.client) {
      throw new Error('Slack client is not initialized');
    }

    try {
      const result = await this.client.chat.postMessage({
        channel: recipient,
        ...message,
      });
      
      return result.ts as string;
    } catch (error) {
      this.logger.error(`Failed to send Slack message: ${error.message}`);
      throw error;
    }
  }

  formatMessage(message: Message): any {
    switch (message.type) {
      case MessageType.CARD:
        return this.formatCardMessage(message as CardMessage);
      
      case MessageType.INTERACTIVE:
        return this.formatInteractiveMessage(message as InteractiveMessage);
      
      case MessageType.TEXT:
      case MessageType.NOTIFICATION:
      default:
        return this.formatTextMessage(message);
    }
  }

  private formatTextMessage(message: Message) {
    return {
      text: message.title ? `*${message.title}*\n${message.content}` : message.content,
    };
  }

  private formatCardMessage(message: CardMessage) {
    const blocks: any[] = [];

    // 标题
    if (message.title) {
      blocks.push({
        type: 'header',
        text: {
          type: 'plain_text',
          text: message.title,
          emoji: true,
        },
      });
    }

    // 内容
    if (message.content) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: message.content,
        },
      });
    }

    // 字段
    if (message.fields && message.fields.length > 0) {
      const fields = message.fields.map(field => ({
        type: 'mrkdwn',
        text: `*${field.name}:*\n${field.value}`,
      }));

      blocks.push({
        type: 'section',
        fields: fields.slice(0, 10), // Slack 限制最多 10 个字段
      });
    }

    // 图片
    if (message.imageUrl) {
      blocks.push({
        type: 'image',
        image_url: message.imageUrl,
        alt_text: message.title || 'Image',
      });
    }

    // 操作按钮
    if (message.actions && message.actions.length > 0) {
      const elements = message.actions.map(action => 
        this.formatAction(action)
      );

      blocks.push({
        type: 'actions',
        elements: elements.slice(0, 5), // Slack 限制最多 5 个按钮
      });
    }

    // 分割线
    if (blocks.length > 0) {
      blocks.push({
        type: 'divider',
      });
    }

    // 添加颜色（作为附件）
    const attachments = message.color ? [{
      color: message.color,
      blocks: [],
    }] : undefined;

    return {
      blocks,
      attachments,
      text: message.content, // 用于通知预览
    };
  }

  private formatInteractiveMessage(message: InteractiveMessage) {
    const blocks: any[] = [];

    // 标题
    if (message.title) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${message.title}*\n${message.content}`,
        },
      });
    }

    // 操作
    if (message.actions && message.actions.length > 0) {
      const elements = message.actions.map(action => 
        this.formatAction(action)
      );

      blocks.push({
        type: 'actions',
        elements,
      });
    }

    return {
      blocks,
      text: message.content,
    };
  }

  private formatAction(action: Action) {
    if (action.type === 'SELECT' && action.options) {
      // 下拉选择
      return {
        type: 'static_select',
        action_id: action.id,
        placeholder: {
          type: 'plain_text',
          text: action.label,
        },
        options: action.options.map(opt => ({
          text: {
            type: 'plain_text',
            text: opt.label,
          },
          value: opt.value,
        })),
      };
    } else {
      // 按钮
      return {
        type: 'button',
        action_id: action.id,
        text: {
          type: 'plain_text',
          text: action.label,
          emoji: true,
        },
        value: action.value || action.id,
        style: this.getSlackButtonStyle(action.style),
      };
    }
  }

  private getSlackButtonStyle(style?: string): string | undefined {
    const styleMap: Record<string, string> = {
      PRIMARY: 'primary',
      DANGER: 'danger',
    };
    return style ? styleMap[style] : undefined;
  }

  protected async checkHealth(): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      await this.client.api.test();
      return true;
    } catch (error) {
      this.logger.error(`Slack health check failed: ${error.message}`);
      return false;
    }
  }

  /**
   * 发送富文本消息（Usage Block Kit）
   */
  async sendRichMessage(channel: string, blocks: any[]) {
    if (!this.isConnected() || !this.client) {
      throw new Error('Slack channel is not connected');
    }

    try {
      const result = await this.client.chat.postMessage({
        channel,
        blocks,
      });
      return result.ts as string;
    } catch (error) {
      this.logger.error(`Failed to send rich message: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update已发送的消息
   */
  async updateMessage(channel: string, timestamp: string, blocks: any[]) {
    if (!this.isConnected() || !this.client) {
      throw new Error('Slack channel is not connected');
    }

    try {
      await this.client.chat.update({
        channel,
        ts: timestamp,
        blocks,
      });
    } catch (error) {
      this.logger.error(`Failed to update message: ${error.message}`);
      throw error;
    }
  }

  /**
   * 添加 Reaction
   */
  async addReaction(channel: string, timestamp: string, emoji: string) {
    if (!this.isConnected() || !this.client) {
      throw new Error('Slack channel is not connected');
    }

    try {
      await this.client.reactions.add({
        channel,
        timestamp,
        name: emoji,
      });
    } catch (error) {
      this.logger.error(`Failed to add reaction: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取 Channel 列表
   */
  async listChannels() {
    if (!this.isConnected() || !this.client) {
      throw new Error('Slack channel is not connected');
    }

    try {
      const result = await this.client.conversations.list({
        types: 'public_channel,private_channel',
      });
      return result.channels;
    } catch (error) {
      this.logger.error(`Failed to list channels: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取User信息
   */
  async getUserInfo(userId: string) {
    if (!this.isConnected() || !this.client) {
      throw new Error('Slack channel is not connected');
    }

    try {
      const result = await this.client.users.info({
        user: userId,
      });
      return result.user;
    } catch (error) {
      this.logger.error(`Failed to get user info: ${error.message}`);
      throw error;
    }
  }
}
