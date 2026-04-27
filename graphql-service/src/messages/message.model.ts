import { Field, ObjectType, ID } from '@nestjs/graphql';
import { User } from 'src/users/user.model';

@ObjectType()
export class Message {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field()
  from: string;

  @Field()
  to: string;

  @Field()
  message: string;

  @Field(() => [String])
  participants: string[];

  @Field(() => User)
  sender: User;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class PageInfo {
  @Field(() => Boolean)
  hasNextPage: boolean;

  @Field(() => [String], { nullable: true })
  endCursor: string[] | null;
}

@ObjectType()
export class PaginatedMessageResponse {
  @Field(() => [Message])
  items: Message[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
