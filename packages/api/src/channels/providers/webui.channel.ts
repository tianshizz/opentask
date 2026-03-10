import { Injectable } from '@nestjs/common';
import { ChannelProvider } from '../channel.provider';
import {
  ChannelType,
  Message,
  CardMessage,
  MessageType,
} from '../channel.interface';
import { EventsGateway } from '../../events/events.gateway';

/**
 * Web UI Channel
 * 通过 WebSocket 发送消息到 Web UI
 */
@Injectable()
export class WebUIChannel extends ChannelProvider {
  constructor(private eventsGateway: EventsGateway) {
    super(ChannelType.WEB_UI, 'WebUI');
  }

  protected async connect(): Promise<void> {
    // Web UI 通过 WebSocket 连接，这里不需要特殊初始化
    this.logger.log('WebUI channel ready (via WebSocket)');
  }

  protected async onDisconnect(): Promise<void> {
    // 不需要特殊清理
    this.logger.log('WebUI channel closed');
  }

  protected async send(message: any, recipient: string): Promise<string> {
    // recipient 可以是 userId、ticketId 等
    // 这里我们通过 WebSocket 广播
    
    if (recipient.startsWith('ticket:')) {
      // 发送到特定 Ticket 的订阅者
      const ticketId = recipient.replace('ticket:', '');
      this.eventsGateway.emitTicketUpdated(ticketId, {
        type: 'notification',
        message,
      });
    } else if (recipient === 'broadcast') {
      // 广播到All连接的客户端
      this.eventsGateway.broadcast('notification', message);
    } else {
      // 发送到特定客户端
      this.eventsGateway.emitToClient(recipient, 'notification', message);
    }
    
    return `webui-${Date.now()}`;
  }

  formatMessage(message: Message): any {
    switch (message.type) {
      case MessageType.CARD:
        return this.formatCardMessage(message as CardMessage);
      
      case MessageType.TEXT:
      case MessageType.NOTIFICATION:
      default:
        return {
          type: message.type,
          title: message.title,
          content: message.content,
          metadata: message.metadata,
          priority: message.priority,
          timestamp: new Date().toISOString(),
        };
    }
  }

  private formatCardMessage(message: CardMessage) {
    return {
      type: 'card',
      title: message.title,
      content: message.content,
      fields: message.fields || [],
      actions: message.actions || [],
      color: message.color || '#3b82f6',
      imageUrl: message.imageUrl,
      timestamp: new Date().toISOString(),
    };
  }

  protected async checkHealth(): Promise<boolean> {
    // 检查 WebSocket Gateway Status
    const stats = this.eventsGateway.getStats();
    return stats.connectedClients !== undefined;
  }
}
