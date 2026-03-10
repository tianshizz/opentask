import { Injectable, Logger } from '@nestjs/common';
import { createHmac } from 'crypto';

/**
 * Slack 交互处理Service
 * 处理 Slack 的按钮点击、选择等交互
 */
@Injectable()
export class SlackInteractionsService {
  private logger = new Logger('SlackInteractionsService');

  /**
   * Validation Slack 请求签名
   */
  verifySlackRequest(
    signature: string,
    timestamp: string,
    body: string,
    signingSecret: string,
  ): boolean {
    const time = Math.floor(Date.now() / 1000);
    
    // 防止重放攻击：请求必须在 5 分钟内
    if (Math.abs(time - parseInt(timestamp)) > 300) {
      this.logger.warn('Request timestamp too old');
      return false;
    }

    // 计算签名
    const sigBasestring = `v0:${timestamp}:${body}`;
    const mySignature = 'v0=' + 
      createHmac('sha256', signingSecret)
        .update(sigBasestring)
        .digest('hex');

    // Usage时间安全的比较
    return this.secureCompare(mySignature, signature);
  }

  /**
   * 时间安全的字符串比较
   */
  private secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    
    return result === 0;
  }

  /**
   * 解析 Slack 交互 payload
   */
  parseInteractionPayload(payload: string): any {
    try {
      return JSON.parse(payload);
    } catch (error) {
      this.logger.error('Failed to parse interaction payload:', error);
      throw new Error('Invalid payload');
    }
  }

  /**
   * 处理按钮点击
   */
  async handleButtonClick(interaction: any): Promise<any> {
    const action = interaction.actions[0];
    const actionId = action.action_id;
    const value = action.value;

    this.logger.log(`Button clicked: ${actionId} = ${value}`);

    // 解析 action value
    const [actionType, ticketId] = value.split(':');

    return {
      actionType,
      ticketId,
      user: interaction.user,
      channel: interaction.channel,
      message: interaction.message,
    };
  }

  /**
   * 创建响应消息（Update原消息）
   */
  createApprovalResponse(approved: boolean, ticketId: string, user: any): any {
    const status = approved ? '✅ 已批准' : '❌ 已拒绝';
    const color = approved ? '#10b981' : '#ef4444';

    return {
      replace_original: true,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*审批结果*\nTicket \`${ticketId}\` ${status}`,
          },
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `操作人: <@${user.id}> | 时间: ${new Date().toLocaleString()}`,
            },
          ],
        },
      ],
      attachments: [
        {
          color,
        },
      ],
    };
  }

  /**
   * 创建Error响应
   */
  createErrorResponse(error: string): any {
    return {
      response_type: 'ephemeral',
      text: `❌ 操作Failed: ${error}`,
    };
  }
}
