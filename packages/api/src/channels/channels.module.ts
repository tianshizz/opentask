import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationService } from './notification.service';
import { WebUIChannel } from './providers/webui.channel';
import { SlackChannel } from './providers/slack.channel';
import { SlackInteractionsService } from './slack-interactions.service';
import { ChannelsController } from './channels.controller';
import { SlackInteractionsController } from './slack-interactions.controller';
import { EventsModule } from '../events/events.module';
import { TicketsModule } from '../modules/tickets/tickets.module';

@Module({
  imports: [EventsModule, TicketsModule],
  controllers: [ChannelsController, SlackInteractionsController],
  providers: [
    NotificationService,
    SlackInteractionsService,
    WebUIChannel,
    SlackChannel,
    {
      provide: 'CHANNELS',
      useFactory: async (
        notificationService: NotificationService,
        webUIChannel: WebUIChannel,
        slackChannel: SlackChannel,
        configService: ConfigService,
      ) => {
        // 注册All Channel
        notificationService.registerChannel(webUIChannel);
        notificationService.registerChannel(slackChannel);
        
        // 初始化 WebUI Channel
        await webUIChannel.initialize({
          type: webUIChannel.type,
          name: webUIChannel.name,
          isActive: true,
          settings: {},
        });
        
        // 初始化 Slack Channel（如果Configuration了）
        const slackEnabled = configService.get<string>('SLACK_ENABLED') === 'true';
        const slackToken = configService.get<string>('SLACK_BOT_TOKEN');
        
        if (slackEnabled && slackToken) {
          try {
            await slackChannel.initialize({
              type: slackChannel.type,
              name: slackChannel.name,
              isActive: true,
              settings: {
                botToken: slackToken,
                signingSecret: configService.get<string>('SLACK_SIGNING_SECRET'),
              },
            });
          } catch (error) {
            console.error('Failed to initialize Slack channel:', error.message);
          }
        }
        
        return [webUIChannel, slackChannel];
      },
      inject: [NotificationService, WebUIChannel, SlackChannel, ConfigService],
    },
  ],
  exports: [NotificationService],
})
export class ChannelsModule {}
