import { GraphQLFieldResolver } from "graphql";

export type Resolver<
  Source = any,
  Context = any,
  Args = Record<string, any>,
> = GraphQLFieldResolver<Source, Context, Args>;
