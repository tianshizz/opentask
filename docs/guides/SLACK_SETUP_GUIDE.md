# Slack Integration Setup Guide

## 🎯 Overview

Opentask supports sending real-time notifications via Slack, allowing your team to receive ticket updates, status changes, and other notifications in Slack.

## 📋 Prerequisites

- Slack Workspace admin permissions
- Node.js and pnpm installed
- Opentask API running

## 🚀 Quick Setup

### Step 1: Create Slack App

1. Visit [Slack API](https://api.slack.com/apps)
2. Click **"Create New App"**
3. Select **"From scratch"**
4. Enter App name（e.g.,`Opentask Bot`）
5. Selectyour Workspace
6. Click **"Create App"**

### Step 2: Configure Bot Permissions

1. In the left sidebar,Select **"OAuth & Permissions"**
2. Scroll to **"Scopes"** section
3. in **"Bot Token Scopes"** add the following permissions：

   **Required Permissions**:
   - `chat:write` - Send messages
   - `chat:write.public` - in public channelsSend messages
   
   **Recommended Permissions**:
   - `channels:read` - Read public channel info
   - `groups:read` - Read private channel info
   - `users:read` - Read user info
   - `reactions:write` - Add emoji reactions

4. Click **"Save Changes"**

### Step 3: Install App to Workspace

1. Scroll to top of page
2. Click **"Install to Workspace"**
3. Review permissions andClick **"Allow"**
4. Copy the displayed **Bot User OAuth Token**（starting with）

### Step 4: Configure Environment Variables

Edit `packages/api/.env` file:

```bash
# Slack Configuration
SLACK_ENABLED=true
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
SLACK_SIGNING_SECRET=your-signing-secret-here
```

**Getting Signing Secret**:
1. In Slack App settings,Select **"Basic Information"**
2. in the **"App Credentials"** sectionfind **"Signing Secret"**
3. Click **"Show"** and copy

### Step 5: Install Dependencies

```bash
cd packages/api
pnpm add @slack/web-api
```

### Step 6: Restart API

```bash
# Stop the currently running API（Ctrl+C）
pnpm dev:api
```

### Step 7: Validate Connection

```bash
# Check channel health status
curl http://localhost:3000/api/v1/channels/health

# Should see Slack connected: true
```

### Step 8: Invite Bot to Channel

In Slack:
1. Open the channel where you want to receive notifications
2. Type `/invite @Opentask Bot`（or your Bot name）
3. Bot can now in this channelsend messages

## 📤 Send Test Message

### Using API

```bash
curl -X POST http://localhost:3000/api/v1/channels/test \
  -H "Content-Type: application/json" \
  -d '{
    "channelType": "SLACK",
    "recipient": "#random"
  }'
```

### Using Code

```typescript
await notificationService.sendNotification(
  ChannelType.SLACK,
  {
    type: MessageType.CARD,
    title: '🎉 Test Notification',
    content: 'Slack Integration successful！',
    fields: [
      { name: 'Status', value: '✅ Connected', inline: true },
      { name: 'Time', value: new Date().toLocaleString(), inline: true },
    ],
    color: '#10b981',
  },
  '#general' // or 'C01234567' (channel ID)
);
```

## 📊 Message Formats

### Text Message

```typescript
{
  type: MessageType.TEXT,
  title: 'Title',
  content: 'Message content',
}
```

Displays in Slack：
```
*Title*
Message content
```

### Card Message

```typescript
{
  type: MessageType.CARD,
  title: '🎫 New Ticket',
  content: 'Ticket #123 Created',
  fields: [
    { name: 'Priority', value: 'HIGH', inline: true },
    { name: 'Status', value: 'OPEN', inline: true },
  ],
  color: '#3b82f6',
  actions: [
    {
      id: 'view',
      type: 'BUTTON',
      label: 'View Details',
      style: 'PRIMARY',
    },
  ],
}
```

Displays in Slack as a rich card containing：
- Title（Header）
- Content（Section）
- Fields（Fields）
- Action buttons（Actions）
- Colored sidebar

## 🎨 Message Styling

### Colors

Use .* attribute to set sidebarColors：

```typescript
color: '#10b981'  // Green - Success
color: '#ef4444'  // Red - Error
color: '#f59e0b'  // Orange - Warning
color: '#3b82f6'  // Blue - Info
```

### Emoji

Use Slack emoji in text：

```typescript
title: ':ticket: New Ticket'
content: ':white_check_mark: Task Complete！'
```

### Markdown

Supports Slack mrkdwn format：

```typescript
content: '*Bold text*\n_Italic text_\n`Code`\n>Quote'
```

## 🔔 Automatic Notifications

Once configured, the following events are automatically sent to Slack：

- ✅ Ticket created
- ✅ Ticket status changed
- ✅ Attempt completed
- ✅ Comment created

### Configure Notification Channel

Specify default in codechannel：

```typescript
// notification.service.ts
@OnEvent(EventType.TICKET_CREATED)
async handleTicketCreated(payload: any) {
  await this.sendNotification(
    ChannelType.SLACK,
    message,
    '#tickets' // Default send to #tickets channel
  );
}
```

## 🎯 Advanced Features

### 1. Interactive Buttons

```typescript
{
  type: MessageType.INTERACTIVE,
  title: 'Action Required',
  content: 'Ticket #123 Awaiting Review',
  actions: [
    {
      id: 'approve',
      type: 'BUTTON',
      label: 'Approve',
      style: 'PRIMARY',
      value: 'approve_123',
    },
    {
      id: 'reject',
      type: 'BUTTON',
      label: 'Reject',
      style: 'DANGER',
      value: 'reject_123',
    },
  ],
}
```

### 2. Select Dropdown

```typescript
{
  actions: [
    {
      id: 'status',
      type: 'SELECT',
      label: 'SelectStatus',
      options: [
        { label: 'In Progress', value: 'IN_PROGRESS' },
        { label: 'Completed', value: 'COMPLETED' },
        { label: 'Cancelled', value: 'CANCELLED' },
      ],
    },
  ],
}
```

### 3. Add Reaction

```typescript
await slackChannel.addReaction(
  '#general',
  '1234567890.123456', // message timestamp
  'white_check_mark'   // emoji name
);
```

### 4. Update Message

```typescript
await slackChannel.updateMessage(
  '#general',
  '1234567890.123456', // message timestamp
  [/* updated blocks */]
);
```

### 5. Listchannel

```typescript
const channels = await slackChannel.listChannels();
console.log(channels.map(c => ({ id: c.id, name: c.name })));
```

## 🔍 Channel ID vs Channel Name

Slack accepts two formats：

**Channel Name** (Recommended for testing):
```typescript
recipient: '#general'
recipient: '#tickets'
```

**Channel ID** (Recommended for production):
```typescript
recipient: 'C01234567'  // More stable, unaffected by channel renaming
```

Get Channel ID：
1. Right-click in Slackchannel
2. Select "Copy link"
3. The ID in the link is the Channel ID（e.g.,C01234567）

## 🐛 Troubleshooting

### Issue 1: "not_in_channel" Error

**Cause**: Bot not invited tochannel

**Solution**:
```
/invite @Opentask Bot
```

### Issue 2: "channel_not_found" Error

**Cause**: channeldoes not exist or Bot no access

**Solution**:
1. Confirm channel name is correct（including `#`）
2. Ensure Bot has `channels:read` Permission
3. Use Channel ID instead of name

### Issue 3: "invalid_auth" Error

**Cause**: Bot Token invalid or expired

**Solution**:
1. Check `.env` in `SLACK_BOT_TOKEN`
2. Ensure Token starting with
3. Regenerate Token

### Issue 4: Message not sent

**Cause**: Slack Channel not initialized

**Solution**:
1. Confirm `SLACK_ENABLED=true`
2. Check API logs for errors
3. Visit `/api/v1/channels/health` CheckStatus

## 📊 Monitoring

### Check ConnectionStatus

```bash
curl http://localhost:3000/api/v1/channels/health
```

Response：
```json
{
  "WEB_UI": {
    "name": "WebUI",
    "connected": true,
    "healthy": true
  },
  "SLACK": {
    "name": "Slack",
    "connected": true,
    "healthy": true
  }
}
```

### View Logs

```bash
# API logs will show
[SlackChannel] Connected to Slack workspace: My Team
[SlackChannel] Sending message via Slack to #general
```

## 🔒 Security Best Practices

1. **Protect Tokens**: 
   - Never commit `.env` to Git
   - Use environment variables to manage tokens
   - Regularly rotate tokens

2. **Principle of Least Privilege**:
   - Only grant necessary permissions
   - Regularly review permissions

3. **Validate Messages**:
   - Use Signing Secret to validate requests
   - Implement rate limiting

## 📝 Environment Variable Reference

```bash
# Slack Configuration
SLACK_ENABLED=true                          # Enable Slack integration
SLACK_BOT_TOKEN=xoxb-xxx                    # Bot User OAuth Token (Required)
SLACK_SIGNING_SECRET=xxx                    # Signing Secret (Recommended)
SLACK_DEFAULT_CHANNEL=#general              # Default channel (Optional)
```

## 🎓 Slack Block Kit

Opentask Usage [Slack Block Kit](https://api.slack.com/block-kit) create rich text messages.

**Block Kit Builder**: https://app.slack.com/block-kit-builder

Usage Builder design messages, then use in code：

```typescript
await slackChannel.sendRichMessage('#general', [
  {
    type: 'header',
    text: {
      type: 'plain_text',
      text: 'Custom message',
    },
  },
  // ... more blocks
]);
```

## 📚 Related Resources

- [Slack API Documentation](https://api.slack.com/docs)
- [Block Kit Guide](https://api.slack.com/block-kit)
- [Web API Methods](https://api.slack.com/methods)
- [@slack/web-api npm](https://www.npmjs.com/package/@slack/web-api)

## ✅ Validation Checklist

- [ ] Slack App Created
- [ ] Bot Permissions configured
- [ ] App installed to Workspace
- [ ] Bot Token added to `.env`
- [ ] `@slack/web-api` installed
- [ ] API restarted
- [ ] `/channels/health` shows Slack Connected
- [ ] Bot invited to targetchannel
- [ ] Test message sent successfully

## 🎉 Complete！

Slack Integration configured successfully！Your team can now receive real-time Opentask notifications in Slack.

---

**Need help?** See Troubleshooting section or create an issue.
