import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { User } from './user.model';
import { estypes } from '@elastic/elasticsearch';

@Injectable()
export class UserSearchService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async searchUsers(name: string, limit: number, cursor?: any[]) {
    const request: estypes.SearchRequest = {
      index: 'users',
      size: limit,
      query: {
        wildcard: {
          'name.keyword': {
            value: `*${name.toLowerCase()}*`,
            case_insensitive: true,
          },
        },
      },
      sort: [
        { updatedAt: { order: 'desc' } } as any,
        { id: { order: 'desc' } } as any,
      ],
      search_after: cursor ?? undefined,
    };

    const response = await this.elasticsearchService.search<User>(request);
    const hits = response.hits.hits;

    return {
      data: hits.map((hit) => hit._source),
      nextCursor: hits.length === limit ? hits[hits.length - 1].sort : null,
      total:
        typeof response.hits.total === 'object' ? response.hits.total.value : 0,
    };
  }
}
