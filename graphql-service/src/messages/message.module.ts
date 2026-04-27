import { Module } from '@nestjs/common';
import { MessageSearchService } from './message-search.service';
import { MessageSearchResolver } from './message-search.resolver';

@Module({
  providers: [MessageSearchService, MessageSearchResolver],
})
export class MessageModule {}
