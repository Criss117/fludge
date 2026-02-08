// Types for the result object with discriminated union
type Success<T> = {
  data: T;
  error: null;
};

type Failure<E> = {
  data: null;
  error: E;
};

type Result<T, E = Error> = Success<T> | Failure<E>;

// Main wrapper function
export async function tryCatch<T, E = Error>(
  promise: Promise<T>,
  options?: { sleep?: number },
): Promise<Result<T, E>> {
  try {
    if (options?.sleep && options.sleep > 0) {
      await new Promise((resolve) => setTimeout(resolve, options.sleep));
    }

    const data = await promise;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as E };
  }
}
