import { Logger } from '@nestjs/common';
import {
  IChannel,
  ChannelType,
  ChannelConfig,
  Message,
  SendResult,
} from './channel.interface';

/**
 * Channel Provider 抽象基类
 * All Channel Implementation都应该继承这个类
 */
export abstract class ChannelProvider implements IChannel {
  protected logger: Logger;
  protected config: ChannelConfig;
  protected connected = false;

  constructor(
    public readonly type: ChannelType,
    public readonly name: string,
  ) {
    this.logger = new Logger(`${name}Channel`);
  }

  /**
   * 初始化 Channel
   */
  async initialize(config: ChannelConfig): Promise<void> {
    this.logger.log(`Initializing ${this.name} channel...`);
    this.config = config;
    
    if (!config.isActive) {
      this.logger.warn(`${this.name} channel is not active`);
      return;
    }

    try {
      await this.connect();
      this.connected = true;
      this.logger.log(`${this.name} channel initialized successfully`);
    } catch (error) {
      this.logger.error(`Failed to initialize ${this.name} channel:`, error);
      throw error;
    }
  }

  /**
   * 断开连接
   */
  async disconnect(): Promise<void> {
    this.logger.log(`Disconnecting ${this.name} channel...`);
    try {
      await this.onDisconnect();
      this.connected = false;
      this.logger.log(`${this.name} channel disconnected`);
    } catch (error) {
      this.logger.error(`Error disconnecting ${this.name} channel:`, error);
      throw error;
    }
  }

  /**
   * 检查连接Status
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * 发送单条消息
   */
  async sendMessage(message: Message, recipient: string): Promise<SendResult> {
    if (!this.isConnected()) {
      return {
        success: false,
        channelType: this.type,
        timestamp: new Date(),
        error: `${this.name} channel is not connected`,
      };
    }

    try {
      this.logger.debug(`Sending message via ${this.name} to ${recipient}`);
      
      const formattedMessage = this.formatMessage(message);
      const messageId = await this.send(formattedMessage, recipient);
      
      return {
        success: true,
        messageId,
        channelType: this.type,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to send message via ${this.name}:`, error);
      return {
        success: false,
        channelType: this.type,
        timestamp: new Date(),
        error: error.message,
      };
    }
  }

  /**
   * 批量发送消息
   */
  async sendBulkMessages(
    messages: Message[],
    recipients: string[],
  ): Promise<SendResult[]> {
    this.logger.log(
      `Sending ${messages.length} messages to ${recipients.length} recipients`,
    );
    
    const results: SendResult[] = [];
    
    for (let i = 0; i < messages.length; i++) {
      for (const recipient of recipients) {
        const result = await this.sendMessage(messages[i], recipient);
        results.push(result);
      }
    }
    
    return results;
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      return this.isConnected() && await this.checkHealth();
    } catch (error) {
      this.logger.error(`Health check failed for ${this.name}:`, error);
      return false;
    }
  }

  // ============= 子类需要Implementation的抽象方法 =============

  /**
   * 连接到 Channel
   */
  protected abstract connect(): Promise<void>;

  /**
   * 断开连接的清理工作
   */
  protected abstract onDisconnect(): Promise<void>;

  /**
   * 实际发送消息的Implementation
   */
  protected abstract send(message: any, recipient: string): Promise<string>;

  /**
   * 格式化消息为特定 Channel 的格式
   */
  abstract formatMessage(message: Message): any;

  /**
   * Channel 特定的健康检查
   */
  protected abstract checkHealth(): Promise<boolean>;
}
