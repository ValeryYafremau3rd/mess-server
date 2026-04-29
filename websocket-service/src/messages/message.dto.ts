import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
}

export class IncomingMessageDto {
  @IsString()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsNotEmpty()
  from: string;

  @IsNotEmpty()
  payload: any;

  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType = MessageType.TEXT;
}
