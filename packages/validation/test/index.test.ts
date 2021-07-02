import { resolver as createResolver } from "@ev-graphql/resolver";
import { UserInputError } from "apollo-server-express";
import Joi from "joi";
import { validation } from "../src/index";

describe("validation", () => {
  const args = {
    name: "webpack",
    version: "5.42.0",
    downloads: 16246494,
  };

  const schema = Joi.object()
    .keys({
      name: Joi.string().required(),
      version: Joi.string().required(),
      downloads: Joi.number().integer().min(0).required(),
    })
    .required();

  it("works for valid args", async () => {
    expect.assertions(4);

    const fn = jest.fn();

    const resolver = createResolver(validation(schema), fn);

    const source = {} as any;
    const _args = { ...args };
    const ctx = {} as any;
    const info = {} as any;

    await resolver(source, _args, ctx, info);

    expect(_args).not.toBe(args);
    expect(_args).toEqual(args);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(source, _args, ctx, info);
  });

  it("throw error on invalid args", async () => {
    expect.assertions(2);

    const fn = jest.fn();

    const resolver = createResolver(validation(schema), fn);

    const source = {} as any;
    const _args = { name: "webpack" };
    const ctx = {} as any;
    const info = {} as any;
    let error = null;

    try {
      await resolver(source, _args, ctx, info);
      fail();
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(UserInputError);
    expect(fn).not.toHaveBeenCalled();
  });

  it("transforms args into valid args", async () => {
    expect.assertions(5);

    const fn = jest.fn();

    const resolver = createResolver(validation(schema), fn);

    const source = {} as any;
    const _args = { ...args } as any;
    const ctx = {} as any;
    const info = {} as any;

    _args.downloads = `${args.downloads}`;

    await resolver(source, _args, ctx, info);

    expect(_args).not.toBe(args);
    expect(_args).toEqual(args);
    expect(Number.isInteger(_args.downloads)).toBe(true);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(source, _args, ctx, info);
  });
});
