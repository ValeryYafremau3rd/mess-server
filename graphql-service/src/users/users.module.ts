import { Module } from '@nestjs/common';
import { UserSearchService } from './user-search.service';
import { UserSearchResolver } from './user-search.resolver';

@Module({
  providers: [UserSearchService, UserSearchResolver],
})
export class UsersModule {}
