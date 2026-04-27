import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UserSearchService } from './user-search.service';
import { PaginatedUserResponse } from './user.model';

@Resolver()
export class UserSearchResolver {
  constructor(private readonly searchService: UserSearchService) {}

  @Query(() => PaginatedUserResponse)
  async searchUsers(
    @Args('name') name: string,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
    @Args('cursor', { type: () => [String], nullable: true }) cursor?: string[],
  ) {
    return this.searchService.searchUsers(name, limit, cursor);
  }
}
