import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('EventsGateway');

  // 跟踪连接的客户端和他们订阅的房间
  private clients = new Map<string, Socket>();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.clients.set(client.id, client);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.clients.delete(client.id);
  }

  // 订阅特定 Ticket 的Update
  @SubscribeMessage('subscribe:ticket')
  handleSubscribeTicket(
    @ConnectedSocket() client: Socket,
    @MessageBody() ticketId: string,
  ) {
    client.join(`ticket:${ticketId}`);
    this.logger.log(`Client ${client.id} subscribed to ticket:${ticketId}`);
    return { event: 'subscribed', data: { ticketId } };
  }

  // 取消订阅 Ticket
  @SubscribeMessage('unsubscribe:ticket')
  handleUnsubscribeTicket(
    @ConnectedSocket() client: Socket,
    @MessageBody() ticketId: string,
  ) {
    client.leave(`ticket:${ticketId}`);
    this.logger.log(`Client ${client.id} unsubscribed from ticket:${ticketId}`);
    return { event: 'unsubscribed', data: { ticketId } };
  }

  // 订阅All Tickets Update
  @SubscribeMessage('subscribe:tickets')
  handleSubscribeTickets(@ConnectedSocket() client: Socket) {
    client.join('tickets');
    this.logger.log(`Client ${client.id} subscribed to all tickets`);
    return { event: 'subscribed', data: { room: 'tickets' } };
  }

  // 发送事件的辅助方法
  emitTicketUpdated(ticketId: string, data: any) {
    this.server.to(`ticket:${ticketId}`).emit('ticket:updated', data);
    this.server.to('tickets').emit('ticket:updated', data);
    this.logger.debug(`Emitted ticket:updated for ${ticketId}`);
  }

  emitAttemptCreated(ticketId: string, data: any) {
    this.server.to(`ticket:${ticketId}`).emit('attempt:created', data);
    this.logger.debug(`Emitted attempt:created for ticket ${ticketId}`);
  }

  emitAttemptUpdated(ticketId: string, data: any) {
    this.server.to(`ticket:${ticketId}`).emit('attempt:updated', data);
    this.logger.debug(`Emitted attempt:updated for ticket ${ticketId}`);
  }

  emitCommentCreated(ticketId: string, data: any) {
    this.server.to(`ticket:${ticketId}`).emit('comment:created', data);
    this.logger.debug(`Emitted comment:created for ticket ${ticketId}`);
  }

  // 发送通知到特定客户端
  emitToClient(clientId: string, event: string, data: any) {
    const client = this.clients.get(clientId);
    if (client) {
      client.emit(event, data);
      this.logger.debug(`Emitted ${event} to client ${clientId}`);
    }
  }

  // 广播到All客户端
  broadcast(event: string, data: any) {
    this.server.emit(event, data);
    this.logger.debug(`Broadcasted ${event} to all clients`);
  }

  // 获取连接统计
  getStats() {
    return {
      connectedClients: this.clients.size,
      rooms: Array.from(this.server.sockets.adapter.rooms.keys()),
    };
  }
}
