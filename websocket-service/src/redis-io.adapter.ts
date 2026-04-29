import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createClient, RedisClientType } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import * as dotenv from 'dotenv';
dotenv.config();

export const redisClient: RedisClientType = createClient({
  url: process.env.REDIS_URL,
});

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis(): Promise<void> {
    const subClient = redisClient.duplicate();
    await Promise.all([redisClient.connect(), subClient.connect()]);
    this.adapterConstructor = createAdapter(redisClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
