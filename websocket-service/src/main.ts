import { NestFactory } from '@nestjs/core';
import { RedisIoAdapter } from './redis-io.adapter';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  await app.listen(3002);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
