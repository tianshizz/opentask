import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from './database/prisma.module';
import { EventsModule } from './events/events.module';
import { ChannelsModule } from './channels/channels.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { AttemptsModule } from './modules/attempts/attempts.module';
import { CommentsModule } from './modules/comments/comments.module';
import { ActorsModule } from './modules/actors/actors.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    EventsModule,
    ChannelsModule,
    TicketsModule,
    AttemptsModule,
    CommentsModule,
    ActorsModule,
  ],
})
export class AppModule {}
