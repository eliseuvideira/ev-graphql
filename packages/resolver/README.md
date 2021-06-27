# @ev-graphql/resolver

> Resolver function for GraphQL

- resolver `resolver: (fn: ResolverFn) => ResolverFn`

<!--
![version](https://img.shields.io/npm/v/@ev-graphql/resolver)
![node](https://img.shields.io/node/v/@ev-graphql/resolver)
![downloads](https://img.shields.io/npm/dw/@ev-graphql/resolver)
![dependencies](https://img.shields.io/david/eliseuvideira/ev-graphql?path=packages%2Fresolver)
[![github](https://img.shields.io/github/stars/eliseuvideira/ev-graphql?style=social)](https://github.com/eliseuvideira/ev-graphql)
-->

## Install

```sh
yarn add graphql @ev-graphql/resolver
```

## Usage

```js
const { AuthenticationError } = require("apollo-server-express");
const { resolver } = require("@ev-graphql/resolver");
const { User } = require("./models/User");

const isAuth = resolver(async (_, args, { req }) => {
  const auth = req.headers.authorization;

  if (!auth || !auth.toLowerCase().startsWith("bearer ")) {
    throw new AuthenticationError("Unauthorized");
  }

  if (auth.slice("bearer ".length) !== process.env.API_TOKEN) {
    throw new AuthenticationError("Unauthorized");
  }
});

const allUsers = resolver(isAuth, async () => {
  const users = await User.find();

  return users;
});

const user = resolver(isAuth, async (_, { _id }) => {
  const user = await User.findById(_id);

  return user;
});

module.exports.resolvers = {
  Query: {
    allUsers,
    user,
  },
};
```
