import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;
}

@ObjectType()
export class PaginatedUserResponse {
  @Field(() => [User])
  data: User[];

  @Field(() => [String], { nullable: true })
  nextCursor: string[];

  @Field(() => Int)
  total: number;
}
