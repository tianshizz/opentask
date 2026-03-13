# 通知系统 (Notification System)

这个通知系统提供了可配置的多渠道消息发送功能，支持在 Ticket 创建和其他事件发生时自动发送通知到不同的渠道。

## 功能特性

- ✅ **可配置**: 支持为不同事件配置不同的通知渠道和设置
- ✅ **多渠道支持**: WebUI、Slack、Discord、Telegram、Email、Webhook
- ✅ **Slack Bot @ 支持**: 可以自动 @bot 来触发自动化流程
- ✅ **优先级管理**: 支持不同优先级的消息
- ✅ **环境变量配置**: 支持通过环境变量进行配置
- ✅ **动态配置**: 运行时可以更新通知配置

## 快速开始

### 1. 基本使用

系统已经配置了默认行为，当 Ticket 创建时会自动发送通知到 WebUI。

```typescript
// Ticket 创建时会自动触发通知
// 事件已在 tickets.service.ts 中发送
```

### 2. 启用 Slack 通知

通过环境变量启用 Slack 通知：

```bash
# 启用 Ticket 创建事件的 Slack 通知
NOTIFICATION_TICKET_CREATED_SLACK_ENABLED=true
NOTIFICATION_TICKET_CREATED_SLACK_RECIPIENT=#general
NOTIFICATION_TICKET_CREATED_SLACK_MENTION_BOT=true

# 重要：要真正 @ 用户，必须提供 Slack User ID（不是 username）
NOTIFICATION_TICKET_CREATED_SLACK_BOT_USER_ID=U01234ABCDE

# Bot username 作为备用（不会真正 @mention）
NOTIFICATION_TICKET_CREATED_SLACK_BOT_USERNAME=@openclaw-bot
```

**如何获取 Slack User ID：**

1. 在 Slack 中，点击要 mention 的用户头像
2. 点击 "View full profile"
3. 点击 "More actions" (三个点) → "Copy member ID"
4. 得到类似 `U01234ABCDE` 的 ID，将其配置到环境变量中

**注意：** Slack 的 @ mention 需要使用 `<@USER_ID>` 格式，而不是 `@username`。如果只提供 `botUsername` 而不提供 `botUserId`，消息中会显示文本但不会真正触发通知。

### 3. 动态指定 Channel Recipient

**在创建 Ticket 时动态指定接收者：**

```typescript
// 创建 ticket 时指定通知渠道和接收者
const ticket = await ticketsService.create({
  title: 'Fix critical bug',
  description: 'Production issue',
  priority: 'HIGH',
  // 动态指定通知设置
  notificationSettings: {
    channels: {
      slack: { 
        recipient: '#engineering',  // 发送到特定频道
        enabled: true               // 可选：覆盖默认启用状态
      },
      discord: {
        recipient: '#urgent-tickets'
      }
    }
  }
}, userId);
```

这样可以根据 ticket 的类型、优先级或其他条件动态选择不同的接收渠道。

### 4. 自定义配置

```typescript
import { NotificationService } from './channels/notification.service';
import { NotificationConfig, ChannelType, MessagePriority } from './channels/channel.interface';

// 自定义配置
const customConfig: NotificationConfig = {
  enabled: true,
  eventType: 'ticket.created',
  channels: [
    {
      type: ChannelType.SLACK,
      enabled: true,
      recipient: '#tickets',
      priority: MessagePriority.HIGH,
      settings: {
        slack: {
          mentionBot: true,
          botUsername: '@my-bot',
        },
      },
    },
  ],
};

// 应用配置
notificationService.updateNotificationConfig('ticket.created', customConfig);
```

## 配置结构

### NotificationConfig

```typescript
interface NotificationConfig {
  enabled: boolean;           // 是否启用此事件的通知
  eventType: string;          // 事件类型
  channels: ChannelNotificationConfig[];  // 渠道配置列表
}
```

### ChannelNotificationConfig

```typescript
interface ChannelNotificationConfig {
  type: ChannelType;          // 渠道类型
  enabled: boolean;           // 是否启用此渠道
  recipient: string;           // 接收者（频道、用户ID等）
  priority?: MessagePriority;  // 消息优先级
  settings?: {                // 渠道特定设置
    slack?: {
      mentionBot?: boolean;   // 是否 @bot
      botUsername?: string;   // bot 用户名
      threadReply?: boolean;  // 是否使用线程回复
    };
  };
}
```

## 支持的事件类型

- `ticket.created` - Ticket 创建
- `ticket.status.changed` - Ticket 状态变更
- `ticket.waiting_review` - Ticket 等待审批
- `attempt.completed` - Attempt 完成
- `comment.created` - 评论创建

## 渠道特定功能

### Slack

- **@bot 支持**: 自动在消息前 @ 指定的 bot
- **线程回复**: 支持在线程中回复
- **自定义频道**: 可以指定任意 Slack 频道

```typescript
// 示例：启用 Slack 通知并 @bot
{
  type: ChannelType.SLACK,
  enabled: true,
  recipient: '#general',
  settings: {
    slack: {
      mentionBot: true,
      botUsername: '@opentask-bot',
    },
  },
}
```

### WebUI

- **广播模式**: 使用 `broadcast` 作为 recipient
- **Ticket 特定**: 使用 `ticket:${ticketId}` 作为 recipient

## API 方法

### NotificationService

```typescript
// 更新通知配置
updateNotificationConfig(eventType: string, config: NotificationConfig)

// 获取通知配置
getNotificationConfig(eventType: string)

// 启用/禁用特定渠道
toggleChannel(eventType: string, channelType: string, enabled: boolean)

// 注册渠道
registerChannel(channel: IChannel)
```

### NotificationConfigService

```typescript
// 获取配置
getConfig(eventType: string)

// 更新配置
updateConfig(eventType: string, config: NotificationConfig)

// 从环境变量加载配置
loadFromEnvironment()

// 批量更新配置
batchUpdateConfigs(configs: Record<string, NotificationConfig>)
```

## 环境变量配置

支持通过环境变量进行配置：

```bash
# Ticket 创建事件的 Slack 配置
NOTIFICATION_TICKET_CREATED_SLACK_ENABLED=true
NOTIFICATION_TICKET_CREATED_SLACK_RECIPIENT=#general
NOTIFICATION_TICKET_CREATED_SLACK_MENTION_BOT=true
NOTIFICATION_TICKET_CREATED_SLACK_BOT_USERNAME=@opentask-bot

# 其他事件类似...
NOTIFICATION_TICKET_STATUS_CHANGED_SLACK_ENABLED=true
NOTIFICATION_TICKET_STATUS_CHANGED_SLACK_RECIPIENT=#updates
```

## 示例配置文件

参考 `notification-config.example.ts` 查看完整的配置示例。

## 故障排除

### 1. 通知未发送

- 检查事件是否正确触发
- 确认配置中 `enabled` 为 `true`
- 检查渠道是否已注册和连接

### 2. Slack Bot 未被 @

- 确认 `settings.slack.mentionBot` 为 `true`
- 检查 `botUsername` 是否正确
- 验证 Slack 渠道配置

### 3. 环境变量不生效

- 确保环境变量名称正确
- 重启应用以加载新的环境变量
- 检查 `loadFromEnvironment()` 是否被调用

## 开发指南

### 添加新的事件类型

1. 在 `events.types.ts` 中添加新的事件类型
2. 在 `DEFAULT_NOTIFICATION_CONFIG` 中添加默认配置
3. 在相应的服务中发送事件
4. 在 `NotificationService` 中添加事件处理器

### 添加新的渠道

1. 在 `channel.interface.ts` 中添加新的 `ChannelType`
2. 实现 `IChannel` 接口
3. 在 `adjustMessageForChannel` 中添加渠道特定的消息调整
4. 在配置接口中添加渠道特定设置

## 最佳实践

1. **使用环境变量**: 在生产环境中使用环境变量进行配置
2. **优先级管理**: 为重要的事件设置更高的优先级
3. **错误处理**: 确保渠道失败时不影响其他渠道
4. **日志记录**: 启用适当的日志级别来监控通知发送
5. **测试配置**: 在测试环境中验证配置是否正确
