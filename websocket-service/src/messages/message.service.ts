import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './message.schema';
import { MessagePayload } from 'src/messages/message.type';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
  ) {}

  async addMessage(data: MessagePayload): Promise<Message> {
    const newMessage = new this.messageModel(data);
    return await newMessage.save();
  }

  async getAndRemovePendingMessages(userId: string): Promise<any[]> {
    const messages = await this.messageModel.find({ to: userId }).lean().exec();

    if (messages.length > 0) {
      await this.messageModel.deleteMany({ to: userId }).exec();
    }

    return messages;
  }
}
