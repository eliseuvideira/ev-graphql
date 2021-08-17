import { ApolloServer } from "apollo-server-express";
import { execute, subscribe } from "graphql";
import http from "http";
import { ServerOptions, SubscriptionServer } from "subscriptions-transport-ws";

export const createSubscriptions =
  (apolloServer: ApolloServer) => (httpServer: http.Server) => {
    const options: ServerOptions = {
      execute,
      subscribe,
    };

    const subscriptionServer = SubscriptionServer.create(options, {
      server: httpServer,
      path: apolloServer.graphqlPath,
    });

    ["SIGINT", "SIGTERM"].forEach((signal) => {
      process.on(signal, () => subscriptionServer.close());
    });

    return subscriptionServer;
  };
