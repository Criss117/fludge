import { describe, test, expect } from "bun:test";
import {
  ok,
  err,
  tryCatch,
  isPromise,
  type Result,
} from "@fludge/utils/trycatch";

// ─── Constructors ─────────────────────────────────────────────────────────────

describe("ok()", () => {
  test("returns a tuple [data, null]", () => {
    const result = ok("hello");

    expect(result).toEqual(["hello", null]);
  });

  test("preserves falsy data (0, empty string, false, null)", () => {
    expect(ok(0)).toEqual([0, null]);
    expect(ok("")).toEqual(["", null]);
    expect(ok(false)).toEqual([false, null]);
    expect(ok(null)).toEqual([null, null]);
  });

  test("preserves object references", () => {
    const obj = { a: 1 };
    const result = ok(obj);

    expect(result[0]).toBe(obj);
    expect(result[1]).toBeNull();
  });
});

describe("err()", () => {
  test("returns a tuple [null, error]", () => {
    const error = new Error("boom");
    const result = err(error);

    expect(result).toEqual([null, error]);
  });

  test("preserves the exact error reference", () => {
    const error = new Error("boom");
    const result = err(error);

    expect(result[1]).toBe(error);
    expect(result[0]).toBeNull();
  });
});

// ─── tryCatch — sync function ─────────────────────────────────────────────────

describe("tryCatch — sync function", () => {
  test("returns ok tuple when the function succeeds", () => {
    const result = tryCatch(() => 42);

    expect(result).toEqual([42, null]);
  });

  test("returns err tuple when the function throws an Error", () => {
    const result = tryCatch(() => {
      throw new Error("sync failure");
    });

    expect(result[0]).toBeNull();
    expect(result[1]).toBeInstanceOf(Error);
    expect((result[1] as Error).message).toBe("sync failure");
  });

  test("wraps a thrown non-Error value in a new Error (default parseError)", () => {
    const result = tryCatch(() => {
      throw "string error";
    });

    expect(result[0]).toBeNull();
    expect(result[1]).toBeInstanceOf(Error);
    expect((result[1] as Error).message).toBe("string error");
  });

  test("wraps a thrown number in a new Error", () => {
    const result = tryCatch(() => {
      throw 404;
    });

    expect(result[1]).toBeInstanceOf(Error);
    expect((result[1] as Error).message).toBe("404");
  });

  test("preserves the exact Error instance thrown", () => {
    const original = new Error("original");
    const result = tryCatch(() => {
      throw original;
    });

    expect(result[1]).toBe(original);
  });
});

// ─── tryCatch — async function ────────────────────────────────────────────────

describe("tryCatch — async function", () => {
  test("resolves to ok tuple when the async function succeeds", async () => {
    const result = await tryCatch(async () => 42);

    expect(result).toEqual([42, null]);
  });

  test("resolves to err tuple when the async function rejects", async () => {
    const result = await tryCatch(async () => {
      throw new Error("async failure");
    });

    expect(result[0]).toBeNull();
    expect(result[1]).toBeInstanceOf(Error);
    expect((result[1] as Error).message).toBe("async failure");
  });

  test("wraps a rejected non-Error value in a new Error", async () => {
    const result = await tryCatch(async () => {
      throw { code: "CUSTOM" };
    });

    expect(result[1]).toBeInstanceOf(Error);
    expect((result[1] as Error).message).toBe("[object Object]");
  });
});

// ─── tryCatch — direct Promise ─────────────────────────────────────────────────

describe("tryCatch — direct Promise", () => {
  test("resolves to ok tuple when the Promise fulfils", async () => {
    const result = await tryCatch(Promise.resolve("value"));

    expect(result).toEqual(["value", null]);
  });

  test("resolves to err tuple when the Promise rejects with an Error", async () => {
    const result = await tryCatch(Promise.reject(new Error("rejected")));

    expect(result[0]).toBeNull();
    expect((result[1] as Error).message).toBe("rejected");
  });

  test("wraps a Promise rejected with a non-Error value", async () => {
    const result = await tryCatch(Promise.reject("fail"));

    expect(result[1]).toBeInstanceOf(Error);
    expect((result[1] as Error).message).toBe("fail");
  });
});

// ─── tryCatch — custom parseError ──────────────────────────────────────────────

class CustomError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "CustomError";
  }
}

describe("tryCatch — custom parseError", () => {
  test("transforms a thrown value via parseError (sync)", () => {
    const result = tryCatch(
      () => {
        throw { code: "NOT_FOUND" };
      },
      { parseError: (raw) => new CustomError(String((raw as any).code), "missing") },
    );

    expect(result[1]).toBeInstanceOf(CustomError);
    expect((result[1] as CustomError).code).toBe("NOT_FOUND");
  });

  test("transforms a rejected Promise via parseError", async () => {
    const result = await tryCatch(Promise.reject("ERR_X"), {
      parseError: (raw) => new CustomError(String(raw), "mapped"),
    });

    expect(result[1]).toBeInstanceOf(CustomError);
    expect((result[1] as CustomError).code).toBe("ERR_X");
  });

  test("parseError receives the raw thrown value, not a wrapped Error", () => {
    const seen: unknown[] = [];

    tryCatch(
      () => {
        throw { nested: true };
      },
      {
        parseError: (raw) => {
          seen.push(raw);
          return new Error("parsed");
        },
      },
    );

    expect(seen[0]).toEqual({ nested: true });
  });
});

// ─── isPromise helper ─────────────────────────────────────────────────────────

describe("isPromise", () => {
  test("returns true for a real Promise", () => {
    expect(isPromise(Promise.resolve(1))).toBe(true);
  });

  test("returns true for a thenable duck-type", () => {
    const thenable = { then: () => {} };
    expect(isPromise(thenable)).toBe(true);
  });

  test("returns false for non-thenable values", () => {
    expect(isPromise(null)).toBe(false);
    expect(isPromise(undefined)).toBe(false);
    expect(isPromise(42)).toBe(false);
    expect(isPromise("str")).toBe(false);
    expect(isPromise({})).toBe(false);
  });
});