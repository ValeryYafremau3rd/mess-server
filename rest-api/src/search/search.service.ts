import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class SearchService {
  constructor(private readonly esService: ElasticsearchService) {}

  async createUser(user: any) {
    await this.esService.index({
      index: 'users',
      id: String(user.id),
      document: {
        id: String(user.id),
        name: user.name,
        updatedAt: new Date(),
      },
    });
  }

  async updateUser(user: any) {
    await this.esService.update({
      index: 'users',
      id: String(user.id),
      doc: {
        name: user.name,
        updatedAt: new Date(),
      },
    });
  }

  async deleteUser(id: any) {
    await this.esService.delete({
      index: 'users',
      id: String(id),
    });
  }
}
