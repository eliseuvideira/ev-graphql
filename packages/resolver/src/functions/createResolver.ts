import { ExpressContext } from "apollo-server-express";
import { Resolver } from "../types/Resolver";

export const createResolver =
  <T extends ExpressContext = ExpressContext>() =>
  <Source = null, Args = Record<string, any>, Context extends T = T>(
    ...fns: Resolver<Source, Context, Args>[]
  ): Resolver<Source, Context, Args> =>
  async (source, args, ctx, info) => {
    for (const fn of fns) {
      const value = await fn(source, args, ctx, info);
      if (value != null) {
        return value;
      }
    }
  };
