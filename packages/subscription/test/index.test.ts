import { subscription } from "../src/index";

describe("subscription", () => {
  it("creates a subscription function", async () => {
    expect.assertions(4);

    const fn = jest.fn();

    const sub = subscription<any, any, Record<string, any>>(fn);

    expect(sub).toBeDefined();
    expect(sub.subscribe).toEqual(fn);

    const source = {};
    const args = {};
    const context = {};
    const info = {} as any;

    await sub.subscribe(source, args, context, info);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(source, args, context, info);
  });
});
