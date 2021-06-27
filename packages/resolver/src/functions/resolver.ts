import { GraphQLFieldResolver } from "graphql";

export type ResolverFn<
  TSource = any,
  TContext = any,
  TArgs = Record<string, any>,
> = GraphQLFieldResolver<TSource, TContext, TArgs>;

export const resolver =
  <TSource = any, TContext = any, TArgs = Record<string, any>>(
    ...fns: ResolverFn<TSource, TContext, TArgs>[]
  ): ResolverFn<TSource, TContext, TArgs> =>
  async (source, args, ctx, info) => {
    for (const fn of fns) {
      const value = await fn(source, args, ctx, info);
      if (value != null) {
        return value;
      }
    }
  };
