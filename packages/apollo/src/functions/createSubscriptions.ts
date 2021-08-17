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

    httpServer.on("close", () => {
      subscriptionServer.close();
    });

    return subscriptionServer;
  };
