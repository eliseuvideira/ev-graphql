import { gql } from "apollo-server-express";

export const typeDefs = gql`
  scalar Upload
  scalar DateTime

  type Query {
    _empty: Boolean
  }

  type Mutation {
    _empty: Boolean
  }

  type Subscriptions {
    _empty: Boolean
  }
`;
