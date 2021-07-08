import { resolver } from "@ev-graphql/resolver";
import { UserInputError } from "apollo-server-express";
import Joi from "joi";

export const validation = (schema: Joi.ObjectSchema) =>
  resolver(async (parent, args) => {
    let parsed: Record<string, any>;
    try {
      parsed = await schema.validateAsync(args);
      for (const key of Object.keys(parsed)) {
        args[key] = parsed[key];
      }
    } catch (err) {
      throw new UserInputError(err.message);
    }
  });
