import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
//import { ClientProxy } from '@nestjs/microservices';
import { SearchService } from 'src/search/search.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    //@Inject('STORE_SERVICE') private readonly redisClient: ClientProxy,
    private readonly searchService: SearchService,
  ) {}

  async create(): Promise<User> {
    const newUser = this.usersRepository.create({
      name: 'user' + Math.random() * 100000000000000000,
    });
    const user = await this.usersRepository.save(newUser);
    //this.redisClient.emit('user.set', user);
    await this.searchService.createUser(user);
    return user;
  }

  async findAll(userId: number): Promise<User[]> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .where('user.id != :userId', { userId })
      .andWhere((qb) => {
        const user_contacts = qb
          .subQuery()
          .select('uc.contactId')
          .from('user_contacts', 'uc')
          .where('uc.userId = :userId')
          .getQuery();
        return 'user.id NOT IN (' + user_contacts + ')';
      })
      .setParameter('userId', userId)
      .getMany();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async update(id: number, name: string): Promise<User> {
    const user = await this.findOne(id);
    user.name = name;
    const saved = await this.usersRepository.save(user);
    await this.searchService.updateUser(user);
    return saved;
  }

  async remove(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);
    //this.redisClient.emit('user.delete', { id });
    if (result.affected === 0) {
      throw new NotFoundException(`User #${id} not found`);
    }

    await this.searchService.deleteUser(id);
  }

  async addContact(userId: number, contactId: number): Promise<void> {
    await this.usersRepository
      .createQueryBuilder()
      .relation(User, 'contacts')
      .of(userId)
      .add(contactId);
  }

  async removeContact(userId: number, contactId: number): Promise<void> {
    await this.usersRepository
      .createQueryBuilder()
      .relation(User, 'contacts')
      .of(userId)
      .remove(contactId);
  }

  async findContacts(userId: number): Promise<User[]> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['contacts'],
    });

    if (!user) throw new NotFoundException('User not found');

    return user.contacts || [];
  }
}
