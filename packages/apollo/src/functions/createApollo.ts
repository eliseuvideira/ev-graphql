import {
  ApolloServer,
  IResolvers,
  ExpressContext,
  ApolloServerExpressConfig,
} from "apollo-server-express";
import { DocumentNode } from "graphql";
import { PubSub } from "graphql-subscriptions";
import { graphqlUploadExpress, UploadOptions } from "graphql-upload";
import { Server } from "http";
import { formatError } from "./formatError";
import { typeDefs as rootTypeDefs } from "../typeDefs";

export interface CreateApolloProps<TContext>
  extends Omit<
    Omit<
      Omit<
        Omit<Omit<ApolloServerExpressConfig, "typeDefs">, "resolvers">,
        "context"
      >,
      "formatError"
    >,
    "uploads"
  > {
  typeDefs?: DocumentNode[];
  resolvers?: IResolvers[];
  context?: TContext & ExpressContext & { pubsub: PubSub };
}

export const createApollo = <TContext>({
  typeDefs,
  resolvers,
  context,
  introspection,
  playground,
}: CreateApolloProps<TContext>) => {
  const pubsub = new PubSub();

  const server = new ApolloServer({
    typeDefs: [rootTypeDefs, ...(typeDefs || [])],
    resolvers,
    context: async (args) => ({ ...context, ...args, pubsub }),
    formatError,
    uploads: false,
    introspection: typeof introspection !== "undefined" ? introspection : true,
    playground:
      typeof playground !== "undefined"
        ? playground
        : { settings: { "request.credentials": "include" } },
  });

  const middleware = () => server.getMiddleware({ cors: false });

  const upload = (options?: UploadOptions) => graphqlUploadExpress(options);

  const subscriptions = (srv: Server) =>
    server.installSubscriptionHandlers(srv);

  return {
    server,
    middleware,
    upload,
    subscriptions,
  };
};
