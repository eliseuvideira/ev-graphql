import { GraphQLFieldResolver } from "graphql";

export type SubscriptionFn<
  TSource = any,
  TContext = any,
  TArgs = Record<string, any>,
> = GraphQLFieldResolver<TSource, TContext, TArgs>;

export const subscription = <
  TSource = any,
  TContext = any,
  TArgs = Record<string, any>,
>(
  fn: SubscriptionFn<TSource, TContext, TArgs>,
) => ({ subscribe: fn });
