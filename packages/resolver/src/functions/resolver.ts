import { GraphQLResolveInfo } from "graphql";

export type ResolverFn<
  TSource = any,
  TContext = any,
  TArgs = Record<string, any>,
  TParams = {
    source?: TSource;
    args?: TArgs;
    context?: TContext;
    info?: GraphQLResolveInfo;
  },
> = (
  source: TSource,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
  params?: TParams,
) => any;

export const resolver =
  <TSource = any, TContext = any, TArgs = Record<string, any>>(
    ...fns: ResolverFn<TSource, TContext, TArgs>[]
  ): ResolverFn<TSource, TContext, TArgs> =>
  async (source, args, ctx, info, params = {}) => {
    for (const fn of fns) {
      const value = await fn(
        params.source || source,
        params.args || args,
        params.context || ctx,
        params.info || info,
        params,
      );
      if (value != null) {
        return value;
      }
    }
  };
