import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import {
  ChannelType,
  MessageType,
  MessagePriority,
} from './channel.interface';

@ApiTags('channels')
@Controller('channels')
export class ChannelsController {
  constructor(private notificationService: NotificationService) {}

  @Get('health')
  @ApiOperation({ summary: 'Get channels health status' })
  @ApiResponse({ status: 200, description: 'Channels health status' })
  async getHealth() {
    return this.notificationService.getChannelsHealth();
  }

  @Post('test')
  @ApiOperation({ summary: 'Send a test notification' })
  @ApiResponse({ status: 200, description: 'Test notification sent' })
  async sendTest(
    @Body() body: { 
      recipient?: string;
      channelType?: ChannelType;
    }
  ) {
    const channelType = body.channelType || ChannelType.WEB_UI;
    const recipient = body.recipient || 'broadcast';

    const testMessage = this.notificationService.createCardNotification(
      '🧪 Test通知',
      `这是通过 ${channelType} 发送的Test通知`,
      [
        { name: '时间', value: new Date().toISOString(), inline: true },
        { name: '渠道', value: channelType, inline: true },
        { name: '接收者', value: recipient, inline: true },
      ],
      '#3b82f6',
    );

    return this.notificationService.sendNotification(
      channelType,
      testMessage,
      recipient,
    );
  }
}
