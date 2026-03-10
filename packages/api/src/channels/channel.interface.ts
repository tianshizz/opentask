// Channel 类型枚举
export enum ChannelType {
  WEB_UI = 'WEB_UI',
  SLACK = 'SLACK',
  DISCORD = 'DISCORD',
  TELEGRAM = 'TELEGRAM',
  EMAIL = 'EMAIL',
  WEBHOOK = 'WEBHOOK',
}

// 消息优先级
export enum MessagePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

// 消息类型
export enum MessageType {
  TEXT = 'TEXT',
  CARD = 'CARD',
  INTERACTIVE = 'INTERACTIVE',
  NOTIFICATION = 'NOTIFICATION',
}

// 基础消息Interface
export interface Message {
  type: MessageType;
  title?: string;
  content: string;
  metadata?: Record<string, any>;
  priority?: MessagePriority;
}

// 文本消息
export interface TextMessage extends Message {
  type: MessageType.TEXT;
}

// 卡片消息（富文本）
export interface CardMessage extends Message {
  type: MessageType.CARD;
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  actions?: Action[];
  imageUrl?: string;
  thumbnailUrl?: string;
  color?: string;
}

// 交互式消息
export interface InteractiveMessage extends Message {
  type: MessageType.INTERACTIVE;
  actions: Action[];
}

// 通知消息
export interface NotificationMessage extends Message {
  type: MessageType.NOTIFICATION;
  ticketId?: string;
  attemptId?: string;
  link?: string;
}

// 操作按钮
export interface Action {
  id: string;
  type: 'BUTTON' | 'SELECT' | 'INPUT';
  label: string;
  value?: string;
  style?: 'PRIMARY' | 'SECONDARY' | 'DANGER' | 'SUCCESS';
  options?: Array<{
    label: string;
    value: string;
  }>;
}

// Channel Configuration
export interface ChannelConfig {
  type: ChannelType;
  name: string;
  isActive: boolean;
  settings: Record<string, any>;
}

// 发送结果
export interface SendResult {
  success: boolean;
  messageId?: string;
  channelType: ChannelType;
  timestamp: Date;
  error?: string;
}

// Channel Interface
export interface IChannel {
  // Channel 信息
  readonly type: ChannelType;
  readonly name: string;
  
  // 初始化和连接
  initialize(config: ChannelConfig): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  
  // 消息发送
  sendMessage(message: Message, recipient: string): Promise<SendResult>;
  sendBulkMessages(messages: Message[], recipients: string[]): Promise<SendResult[]>;
  
  // 消息格式化
  formatMessage(message: Message): any;
  
  // 健康检查
  healthCheck(): Promise<boolean>;
}
