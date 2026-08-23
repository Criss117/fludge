import { describe, expect, it } from "bun:test";
import { err, isPromise, ok, tryCatch } from "../src/trycatch";

describe("tryCatch", () => {
  it("returns a successful result for a sync operation", () => {
    expect(tryCatch(() => 42)).toEqual([42, null]);
  });

  it("returns an Error for a sync failure", () => {
    const [data, error] = tryCatch<number>((): number => {
      throw new Error("fail");
    });

    expect(data).toBeNull();
    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toBe("fail");
  });

  it("converts non-Error thrown values to Errors", () => {
    const [, error] = tryCatch<number>((): number => {
      throw "oops";
    });

    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toBe("oops");
  });

  it("uses a custom error parser", () => {
    const customError = new TypeError("parsed");
    const [, error] = tryCatch<number, TypeError>(
      (): number => {
        throw "raw";
      },
      { parseError: () => customError },
    );

    expect(error).toBe(customError);
  });

  it("returns successful results for promises and async functions", async () => {
    expect(await tryCatch(Promise.resolve(42))).toEqual([42, null]);
    expect(await tryCatch(async () => 42)).toEqual([42, null]);
  });

  it("returns parsed Errors for rejected promises and async failures", async () => {
    const promiseResult = await tryCatch(Promise.reject(new Error("fail")));
    const asyncResult = await tryCatch(async () => {
      throw new Error("fail");
    });

    expect(promiseResult[0]).toBeNull();
    expect(promiseResult[1]).toBeInstanceOf(Error);
    expect(asyncResult[0]).toBeNull();
    expect(asyncResult[1]?.message).toBe("fail");
  });

  it("constructs successful and failed results", () => {
    expect(ok(42)).toEqual([42, null]);
    expect(err(new Error("x"))).toEqual([null, new Error("x")]);
  });
});

describe("isPromise", () => {
  it("detects promises", () => {
    expect(isPromise(Promise.resolve())).toBe(true);
  });

  it("rejects non-promises", () => {
    expect(isPromise(42)).toBe(false);
  });
});
