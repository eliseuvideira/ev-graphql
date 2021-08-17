import { ContextFunction } from "apollo-server-core";
import { ExpressContext } from "apollo-server-express";
import { PubSub } from "graphql-subscriptions";

export const createContext =
  <T extends ExpressContext>(
    context: Record<string, any> | ContextFunction<T, Record<string, any>>,
    pubsub: PubSub,
  ) =>
  async <K extends T>(args: K) => {
    if (typeof context === "object") {
      return { pubsub, ...context, ...args };
    }

    const ctx = await context(args);

    return { ...ctx, pubsub };
  };
