import {
  ApolloServer,
  ExpressContext,
  ApolloServerExpressConfig,
} from "apollo-server-express";
import { DocumentNode } from "graphql";
import { PubSub } from "graphql-subscriptions";
import { graphqlUploadExpress, UploadOptions } from "graphql-upload";
import { formatError } from "./formatError";
import { typeDefs as rootTypeDefs } from "../typeDefs";
import { createSubscriptions } from "./createSubscriptions";
import { IResolvers } from "@graphql-tools/utils";
import { ApolloServerPluginLandingPageDisabled } from "apollo-server-core";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { createContext } from "./createContext";

export type CreateApolloBaseProps = Omit<
  Omit<Omit<ApolloServerExpressConfig, "typeDefs">, "resolvers">,
  "context"
>;

export interface ApolloContext extends ExpressContext {
  pubsub: PubSub;
}

export type CustomContext<T extends ApolloContext = ApolloContext> = Omit<
  Omit<Omit<T, "req">, "res">,
  "pubsub"
>;

export interface CreateApolloProps<T extends ApolloContext = ApolloContext>
  extends CreateApolloBaseProps,
    UploadOptions {
  resolvers: IResolvers[];
  typeDefs: DocumentNode[];
  context?: CustomContext<T> | ((context: T) => T);
}

export const createApollo = <T extends ApolloContext = ApolloContext>({
  typeDefs,
  resolvers,
  context = {} as CustomContext<T>,
  introspection,
  ...props
}: CreateApolloProps<T>) => {
  const pubsub = new PubSub();

  const schema = makeExecutableSchema({
    typeDefs: [rootTypeDefs, ...typeDefs],
    resolvers,
  });

  const server = new ApolloServer<T & ExpressContext>({
    schema,
    context: createContext(context, pubsub),
    formatError,
    plugins: [ApolloServerPluginLandingPageDisabled()],
    introspection:
      typeof introspection !== "undefined"
        ? introspection
        : process.env.NODE_ENV !== "production",
    ...props,
  });

  const middleware = () => server.getMiddleware({ cors: false });

  const upload = (options?: UploadOptions) => graphqlUploadExpress(options);

  const subscriptions = createSubscriptions(server);

  return {
    server,
    middleware,
    upload,
    subscriptions,
  };
};
