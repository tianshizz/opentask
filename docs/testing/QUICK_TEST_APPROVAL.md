# 快速Test Slack 审批Features

## ✅ FixComplete

已添加事件发送到 `updateStatus` 方法。现在当 Ticket Status变为 `WAITING_REVIEW` 时会自动发送 Slack 通知。

## 🧪 TestStep

### 1. 确认 Slack Configuration

在 `packages/api/.env` 中：
```bash
SLACK_ENABLED=true
SLACK_BOT_TOKEN=xoxb-your-token-here
SLACK_SIGNING_SECRET=your-secret-here
```

### 2. 创建 #approvals 频道并邀请 Bot

在 Slack 中：
```
/invite @Opentask Bot
```

### 3. 等待 API 重启

API 会自动重新编译（几秒钟）。

### 4. Update Ticket Status

Usage你的 Ticket ID：
```bash
curl -X PATCH http://localhost:3000/api/v1/tickets/540270b3-d9a3-41d4-ae29-f7c1be3d1e25/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "WAITING_REVIEW",
    "reason": "请审批此 Ticket",
    "actorId": "system"
  }'
```

或者通过 UI UpdateStatus。

### 5. 检查 Slack #approvals 频道

应该立即看到这样的消息：

```
┌────────────────────────────────────┐
│ 🔔 需要审批                         │
├────────────────────────────────────┤
│ [Ticket 标题]                       │
│ [Ticket 描述]                       │
│                                     │
│ Ticket ID: 540270b3-...             │
│ 优先级: MEDIUM                      │
│ 创建时间: 2026-03-11 00:00:00      │
├────────────────────────────────────┤
│ [✅ 批准]  [❌ 拒绝]                │
└────────────────────────────────────┘
```

### 6. 点击按钮Test

点击 **✅ 批准**：
- Ticket Status变为 `COMPLETED`
- Slack 消息Update显示审批结果

点击 **❌ 拒绝**：
- Ticket Status变为 `NEEDS_REVISION`
- Slack 消息Update显示拒绝结果

## 🔍 检查日志

API 日志应该显示：

```bash
# 当Status变为 WAITING_REVIEW
[NotificationService] Sending approval request to Slack #approvals
[SlackChannel] Sending message via Slack to #approvals

# 当点击按钮
[SlackInteractionsController] Received interaction type: block_actions
[SlackInteractionsController] Action: approve on ticket: 540270b3-... by user: U01234567
[TicketsService] Ticket 540270b3-... approved
```

## 🐛 如果没有收到消息

### 检查清单

1. **Slack 是否已连接？**
   ```bash
   curl http://localhost:3000/api/v1/channels/health
   ```
   应该看到：
   ```json
   {
     "SLACK": {
       "name": "Slack",
       "connected": true,
       "healthy": true
     }
   }
   ```

2. **Bot 是否在 #approvals 频道？**
   - 在 Slack 中检查频道成员
   - 如果没有，运行：`/invite @Opentask Bot`

3. **检查 API 日志**
   - 是否有Error信息？
   - 是否触发了事件？

4. **Prisma Client Issue？**
   如果看到很多 Prisma 类型Error：
   ```bash
   cd packages/api
   pnpm prisma generate
   pnpm dev:api
   ```

## 📝 事件流程

```
1. Update Ticket Status → WAITING_REVIEW
   ↓
2. TicketsService.updateStatus()
   ↓
3. EventEmitter.emit(TICKET_STATUS_CHANGED)
   ↓
4. NotificationService.handleTicketStatusChanged()
   ↓
5. NotificationService.sendApprovalRequest()
   ↓
6. SlackChannel.sendMessage()
   ↓
7. Slack API → #approvals 频道
   ↓
8. User看到消息（带按钮）
```

## ✅ 预期结果

- ✅ Slack #approvals 收到消息
- ✅ 消息包含 Ticket 详情
- ✅ 显示 ✅ 批准 和 ❌ 拒绝 按钮
- ✅ WebUI 也收到通知（实时）

## 🎯 交互Test（需要Configuration Webhook）

要Test按钮点击Features，需要：

1. **Usage ngrok 暴露本地端口**
   ```bash
   ngrok http 3000
   ```

2. **在 Slack App 设置中Configuration Request URL**
   ```
   https://xxxx.ngrok.io/api/v1/slack/interactions
   ```

3. **点击按钮**
   - Slack 会发送回调到你的 API
   - API Update Ticket Status
   - Slack 消息自动Update

## 🎉 Complete！

如果一切正常：
- Ticket 变为 WAITING_REVIEW → Slack 收到消息 ✅
- 点击批准 → Ticket Status变为 COMPLETED ✅
- 点击拒绝 → Ticket Status变为 NEEDS_REVISION ✅

**审批工作流完全可用！** 🚀
