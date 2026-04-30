import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthService } from 'src/auth/auth.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  async create() {
    const user = await this.usersService.create();
    const token = await this.authService.generateToken(user.id);
    return {
      user,
      ...token,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@GetUser('id') userId: number) {
    return this.usersService.findOne(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  update(@GetUser('id') userId: number, @Body('name') name: string) {
    return this.usersService.update(userId, name);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  remove(@GetUser('id') userId: number) {
    return this.usersService.remove(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@GetUser('id') userId: number) {
    return this.usersService.findAll(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/contacts/:contactId')
  async addContact(
    @GetUser('id') userId: number,
    @Param('contactId', ParseIntPipe) contactId: number,
  ) {
    await this.usersService.addContact(userId, contactId);
    return { message: 'Contact added' };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/contacts/:contactId')
  async removeContact(
    @GetUser('id') userId: number,
    @Param('contactId', ParseIntPipe) contactId: number,
  ) {
    await this.usersService.removeContact(userId, contactId);
    return { message: 'Contact removed' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('contacts')
  async getMyContacts(@GetUser('id') userId: number) {
    return this.usersService.findContacts(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  async getUserById(@Param('userId', ParseIntPipe) userId: number) {
    return this.usersService.findOne(userId);
  }
}
