import {
  ApolloServer,
  ExpressContext,
  ApolloServerExpressConfig,
} from "apollo-server-express";
import { DocumentNode, GraphQLFieldResolver } from "graphql";
import { PubSub } from "graphql-subscriptions";
import { graphqlUploadExpress, UploadOptions } from "graphql-upload";
import { formatError } from "./formatError";
import { typeDefs as rootTypeDefs } from "../typeDefs";
import { createSubscriptions } from "./createSubscriptions";
import { IResolvers } from "@graphql-tools/utils";
import {
  ApolloServerPluginLandingPageDisabled,
  ContextFunction,
} from "apollo-server-core";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { createContext } from "./createContext";

export type CreateApolloBaseProps = Omit<
  Omit<Omit<ApolloServerExpressConfig, "typeDefs">, "resolvers">,
  "context"
>;

export type ResolverFn<
  TSource = any,
  TContext = any,
  TArgs = Record<string, any>,
> = GraphQLFieldResolver<TSource, TContext, TArgs>;

export interface CreateApolloProps<T extends ExpressContext>
  extends CreateApolloBaseProps,
    UploadOptions {
  resolvers: IResolvers[];
  typeDefs: DocumentNode[];
  context?: Record<string, any> | ContextFunction<T>;
  cors?: boolean;
}

export const createApollo = <T extends ExpressContext>({
  typeDefs,
  resolvers,
  context = {},
  introspection,
  ...props
}: CreateApolloProps<T>) => {
  const pubsub = new PubSub();

  const schema = makeExecutableSchema({
    typeDefs: [rootTypeDefs, ...typeDefs],
    resolvers,
  });

  const server = new ApolloServer({
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

  const createResolverHandler =
    <TSource = any, TContext = T, TArgs = Record<string, any>>() =>
    (
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

  return {
    server,
    middleware,
    upload,
    subscriptions,
    createResolverHandler,
  };
};
