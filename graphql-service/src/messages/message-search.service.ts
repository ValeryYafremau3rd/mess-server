import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class MessageSearchService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}
  async findBetweenUsers(
    userA: string,
    userB: string,
    limit: number,
    cursor?: string[],
  ) {
    const result = await this.elasticsearchService.search({
      index: 'messages',
      body: {
        size: limit + 1,
        query: {
          bool: {
            must: [
              { term: { participants: userA } },
              { term: { participants: userB } },
            ],
          },
        },
        search_after: cursor || undefined,
        sort: [{ createdAt: { order: 'desc' } }, { _doc: { order: 'desc' } }],
      },
    });

    const hits = result.hits.hits;
    const hasNextPage = hits.length > limit;
    const itemsToReturn = hasNextPage ? hits.slice(0, limit) : hits;
    const lastHit = itemsToReturn[itemsToReturn.length - 1];
    const endCursor = lastHit ? (lastHit.sort as string[]) : null;

    return {
      items: itemsToReturn.map((hit) => ({
        id: hit._id,
        ...(hit._source as any),
        createdAt: new Date((hit._source as any).createdAt),
      })),
      pageInfo: {
        hasNextPage,
        endCursor,
      },
    };
  }
}
