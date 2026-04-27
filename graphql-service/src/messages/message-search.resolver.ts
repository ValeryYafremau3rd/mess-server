import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { MessageSearchService } from './message-search.service';
import { PaginatedMessageResponse } from './message.model';

@Resolver()
export class MessageSearchResolver {
  constructor(private readonly searchService: MessageSearchService) {}

  @Query(() => PaginatedMessageResponse, { name: 'getChatHistory' })
  async getChatHistory(
    @Args('userA') userA: string,
    @Args('userB') userB: string,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
    @Args('cursor', { type: () => [String], nullable: true }) cursor?: string[],
  ) {
    return this.searchService.findBetweenUsers(userA, userB, limit, cursor);
  }
}
