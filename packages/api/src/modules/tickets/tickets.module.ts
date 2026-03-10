import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { TicketStateMachine } from './ticket-state-machine.service';

@Module({
  controllers: [TicketsController],
  providers: [TicketsService, TicketStateMachine],
  exports: [TicketsService],
})
export class TicketsModule {}
