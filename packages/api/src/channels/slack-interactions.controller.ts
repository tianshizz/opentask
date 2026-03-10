import { 
  Controller, 
  Post, 
  Body, 
  Headers, 
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SlackInteractionsService } from './slack-interactions.service';
import { TicketsService } from '../modules/tickets/tickets.service';

/**
 * Slack 交互端点
 * 接收 Slack 的交互回调（按钮点击等）
 */
@ApiTags('slack')
@Controller('slack')
export class SlackInteractionsController {
  private logger = new Logger('SlackInteractionsController');

  constructor(
    private slackInteractionsService: SlackInteractionsService,
    private ticketsService: TicketsService,
    private configService: ConfigService,
  ) {}

  /**
   * Slack 交互 Webhook
   * 接收按钮点击、选择等交互
   */
  @Post('interactions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Slack interactions' })
  async handleInteractions(
    @Req() req: Request,
    @Headers('x-slack-signature') signature: string,
    @Headers('x-slack-request-timestamp') timestamp: string,
    @Body() body: any,
  ) {
    this.logger.log('Received Slack interaction request');
    
    // Validation签名
    const signingSecret = this.configService.get<string>('SLACK_SIGNING_SECRET');
    
    if (signingSecret && signature && timestamp) {
      // 获取原始请求体
      const rawBody = req.rawBody;
      
      if (!rawBody) {
        this.logger.error('Raw body not available - middleware not configured');
        throw new BadRequestException('Server configuration error');
      }

      // Validation签名
      const isValid = this.slackInteractionsService.verifySlackRequest(
        signature,
        timestamp,
        rawBody.toString(),
        signingSecret,
      );

      if (!isValid) {
        this.logger.warn('Invalid Slack signature');
        throw new BadRequestException('Invalid signature');
      }
      
      this.logger.log('Slack signature verified successfully');
    } else {
      this.logger.warn('Signature verification skipped - signing secret not configured');
    }

    // 解析 payload
    const payload = this.slackInteractionsService.parseInteractionPayload(
      body.payload,
    );

    this.logger.log(`Received interaction type: ${payload.type}`);

    // 处理不同类型的交互
    switch (payload.type) {
      case 'block_actions':
        return this.handleBlockActions(payload);
      
      case 'view_submission':
        return this.handleViewSubmission(payload);
      
      default:
        this.logger.warn(`Unknown interaction type: ${payload.type}`);
        return { ok: true };
    }
  }

  /**
   * 处理 Block Actions（按钮点击等）
   */
  private async handleBlockActions(payload: any) {
    try {
      const action = await this.slackInteractionsService.handleButtonClick(payload);
      
      const { actionType, ticketId, user } = action;

      this.logger.log(`Action: ${actionType} on ticket: ${ticketId} by user: ${user.id}`);

      // 处理审批操作
      if (actionType === 'approve') {
        await this.approveTicket(ticketId, user);
        return this.slackInteractionsService.createApprovalResponse(
          true,
          ticketId,
          user,
        );
      } else if (actionType === 'reject') {
        await this.rejectTicket(ticketId, user);
        return this.slackInteractionsService.createApprovalResponse(
          false,
          ticketId,
          user,
        );
      }

      return { ok: true };
    } catch (error) {
      this.logger.error('Failed to handle block action:', error);
      return this.slackInteractionsService.createErrorResponse(error.message);
    }
  }

  /**
   * 处理 View Submission（Modal 提交）
   */
  private async handleViewSubmission(payload: any) {
    // 未来可以用于更复杂的审批表单
    return { response_action: 'clear' };
  }

  /**
   * 批准 Ticket
   */
  private async approveTicket(ticketId: string, user: any) {
    try {
      // 获取 ticket 信息以获取有效的 actorId
      const ticket = await this.ticketsService.findOne(ticketId);
      
      // Usage ticket 的创建者作为 actor
      const actorId = ticket.createdById;

      await this.ticketsService.approve(
        ticketId,
        `通过 Slack 批准 by @${user.name} (${user.id})`,
        actorId,
      );

      this.logger.log(`Ticket ${ticketId} approved by Slack user ${user.name}`);
    } catch (error) {
      this.logger.error(`Failed to approve ticket ${ticketId}:`, error);
      throw error;
    }
  }

  /**
   * 拒绝 Ticket
   */
  private async rejectTicket(ticketId: string, user: any) {
    try {
      // 获取 ticket 信息以获取有效的 actorId
      const ticket = await this.ticketsService.findOne(ticketId);
      
      // Usage ticket 的创建者作为 actor
      const actorId = ticket.createdById;

      await this.ticketsService.requestRevision(
        ticketId,
        `通过 Slack 拒绝 by @${user.name} (${user.id})`,
        actorId,
      );

      this.logger.log(`Ticket ${ticketId} rejected by Slack user ${user.name}`);
    } catch (error) {
      this.logger.error(`Failed to reject ticket ${ticketId}:`, error);
      throw error;
    }
  }
}
