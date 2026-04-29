import { Module } from '@nestjs/common';
import { ChatGateway } from './gateways/chat.gateway';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MessagesModule } from './messages/message.module';
import { AuthService } from './auth/auth.service';
import { KeyModule } from './keys/key.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),
    MessagesModule,
    KeyModule,
  ],
  controllers: [AppController],
  providers: [ChatGateway, AppService, AuthService],
})
export class AppModule {}
