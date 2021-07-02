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

export interface CreateApolloProps<TContext>
  extends Omit<
    Omit<Omit<ApolloServerExpressConfig, "typeDefs">, "resolvers">,
    "context"
  > {
  typeDefs?: DocumentNode[];
  resolvers?: IResolvers[];
  context?: TContext & ExpressContext & { pubsub: PubSub };
}

export const createApollo = <TContext>({
  typeDefs,
  resolvers,
  context,
  playground,
}: CreateApolloProps<TContext>) => {
  const pubsub = new PubSub();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: { ...context, pubsub },
    formatError,
    uploads: false,
    introspection: true,
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
