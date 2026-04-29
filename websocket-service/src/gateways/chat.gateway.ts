import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';

import { redisClient } from '../redis-io.adapter';
import { GetUserId } from 'src/auth/userId.decorator';
import { WsJwtGuard } from 'src/auth/ws-jwt.guard';
import { AuthService } from 'src/auth/auth.service';
import { MessagesService } from 'src/messages/message.service';
import { IncomingMessageDto } from 'src/messages/message.dto';
import { MessagePayload } from 'src/messages/message.type';
import { KeyService } from 'src/keys/key.service';
import { SignalGateway } from './signal.gateway';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  transports: ['websocket'],
})
export class ChatGateway
  extends SignalGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly ONLINE_TTL = 60;

  constructor(
    private readonly messagesService: MessagesService,
    private readonly authService: AuthService,
    readonly keyService: KeyService,
  ) {
    super();
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      const payload = await this.authService.validateToken(token);
      const userId = payload.sub;

      if (userId) {
        await client.join(`user:${userId}`);
        await redisClient.set(`online:${userId}`, 'true', {
          EX: this.ONLINE_TTL,
        });
        console.log(`User ${userId} connected.`);
      }

      const pendingMessages =
        await this.messagesService.getAndRemovePendingMessages(userId);
      client.emit('PENDING_MESSAGES', pendingMessages);

      await this.checkPreKeys(client, userId);
    } catch (error) {
      console.log(`Offline delivery error: ${error.message}`);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('HEARTBEAT')
  async handleHeartbeat(@GetUserId() userId: string) {
    if (userId) {
      await redisClient.expire(`online:${userId}`, this.ONLINE_TTL);
    }
  }

  @UseGuards(WsJwtGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @SubscribeMessage('MESSAGE')
  async handleIncomingMessage(@MessageBody() data: IncomingMessageDto) {
    const messagePayload: MessagePayload = {
      ...data,
      time: Date.now(),
      type: data.type || 'TEXT',
    };

    const isOnline = await redisClient.exists(`online:${messagePayload.to}`);

    if (isOnline) {
      this.server
        .to(`user:${messagePayload.to}`)
        .emit('MESSAGE', messagePayload);
    } else {
      await this.messagesService.addMessage(messagePayload);
    }
  }

  async handleDisconnect(client: Socket) {
    const token = client.handshake.auth?.token;
    const payload = await this.authService.validateToken(token);
    const userId = payload.sub;
    if (userId) {
      await redisClient.del(`online:${userId}`);
      console.log(`User ${userId} disconnected.`);
    }
  }
}
