import { resolver, ResolverFn } from "../src/index";

describe("resolver", () => {
  it("creates a resolver function", async () => {
    expect.assertions(2);

    const fn = jest.fn();

    const instance = resolver(fn);

    const parent = {} as any;
    const args = {} as any;
    const context = {} as any;
    const info = {} as any;

    await instance(parent, args, context, info);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(parent, args, context, info);
  });

  it("allows for chaining resolver functions", async () => {
    expect.assertions(7);

    const order: any[] = [];

    const fn1: ResolverFn = jest.fn(() => {
      order.push(fn1);
    });
    const fn2: ResolverFn = jest.fn(() => {
      order.push(fn2);
    });

    const instance = resolver(fn1, fn2);

    const parent = {} as any;
    const args = {} as any;
    const context = {} as any;
    const info = {} as any;

    await instance(parent, args, context, info);

    expect(fn1).toHaveBeenCalledTimes(1);
    expect(fn1).toHaveBeenCalledWith(parent, args, context, info);
    expect(fn2).toHaveBeenCalledTimes(1);
    expect(fn2).toHaveBeenCalledWith(parent, args, context, info);
    expect(order.length).toEqual(2);
    expect(order[0]).toEqual(fn1);
    expect(order[1]).toEqual(fn2);
  });

  it("stops if one resolver returns a value", async () => {
    expect.assertions(4);

    const value = {};

    const fn1: ResolverFn = jest.fn(() => value);
    const fn2: ResolverFn = jest.fn();

    const instance = resolver(fn1, fn2);

    const parent = {} as any;
    const args = {} as any;
    const context = {} as any;
    const info = {} as any;

    const item = await instance(parent, args, context, info);

    expect(item).toBe(value);
    expect(fn1).toHaveBeenCalledTimes(1);
    expect(fn1).toHaveBeenCalledWith(parent, args, context, info);
    expect(fn2).not.toHaveBeenCalled();
  });

  it("stops on error", async () => {
    expect.assertions(4);

    const error = new Error("failed");

    const fn1: ResolverFn = jest.fn(async () => {
      throw error;
    });
    const fn2: ResolverFn = jest.fn();

    const instance = resolver(fn1, fn2);

    const parent = {} as any;
    const args = {} as any;
    const context = {} as any;
    const info = {} as any;

    try {
      await instance(parent, args, context, info);
      fail();
    } catch (err) {
      expect(err).toBe(error);
    }
    expect(fn1).toHaveBeenCalledTimes(1);
    expect(fn1).toHaveBeenCalledWith(parent, args, context, info);
    expect(fn2).not.toHaveBeenCalled();
  });

  it("allows better intellisense", async () => {
    expect.assertions(5);

    const fn = jest.fn();

    const instance = resolver<
      { id: number },
      { pubsub: any },
      { value: number }
    >((source, args, context, info) => {
      expect(source.id).toBeDefined();
      expect(args.value).toBeDefined();
      expect(context.pubsub).toBeDefined();
      expect(info.fieldName).toBeDefined();
      fn();
    });

    await instance(
      { id: Math.random() },
      { value: Math.random() },
      { pubsub: {} },
      { fieldName: "id" } as any
    );

    expect(fn).toHaveBeenCalledTimes(1);
  });
});
