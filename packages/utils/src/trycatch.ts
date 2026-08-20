// ─── Result Types ─────────────────────────────────────────────────────────────

export type Ok<TData> = readonly [data: TData, error: null];

export type Err<TError> = readonly [data: null, error: TError];

export type Result<TData, TError = Error> = Ok<TData> | Err<TError>;

// ─── Constructors ─────────────────────────────────────────────────────────────

/**
 * Construye un resultado exitoso.
 */
export const ok = <TData>(data: TData): Ok<TData> => [data, null];

/**
 * Construye un resultado fallido.
 */
export const err = <TError>(error: TError): Err<TError> => [null, error];

// ─── Utility Types ────────────────────────────────────────────────────────────

/**
 * Verifica si un tipo es EXACTAMENTE `Error`
 * y no una subclase.
 */
type IsExactlyError<T> = [T] extends [Error]
  ? [Error] extends [T]
    ? true
    : false
  : false;

// ─── Options ──────────────────────────────────────────────────────────────────

/**
 * Si TError es EXACTAMENTE `Error`,
 * `parseError` es opcional.
 *
 * Para cualquier otro tipo/subclase,
 * `parseError` es obligatorio.
 */
export type TryCatchOptions<TError> =
  IsExactlyError<TError> extends true
    ? {
        parseError?: (raw: unknown) => TError;
      }
    : {
        parseError: (raw: unknown) => TError;
      };

// ─── Overloads ────────────────────────────────────────────────────────────────

/**
 * Promise directa.
 */
export function tryCatch<TData, TError = Error>(
  operation: Promise<TData>,
  options?: TryCatchOptions<TError>,
): Promise<Result<TData, TError>>;

/**
 * Función async.
 */
export function tryCatch<TData, TError = Error>(
  operation: () => Promise<TData>,
  options?: TryCatchOptions<TError>,
): Promise<Result<TData, TError>>;

/**
 * Función sync.
 */
export function tryCatch<TData, TError = Error>(
  operation: () => TData,
  options?: TryCatchOptions<TError>,
): Result<TData, TError>;

// ─── Implementation ───────────────────────────────────────────────────────────

export function tryCatch<TData, TError = Error>(
  operation: Promise<TData> | (() => TData) | (() => Promise<TData>),
  options?: TryCatchOptions<TError>,
): Result<TData, TError> | Promise<Result<TData, TError>> {
  const toError = (raw: unknown): TError => {
    if (options?.parseError) {
      return options.parseError(raw);
    }

    // Esta rama SOLO es válida cuando TError = Error.
    return (raw instanceof Error ? raw : new Error(String(raw))) as TError;
  };

  try {
    const result = typeof operation === "function" ? operation() : operation;

    if (isPromise<TData>(result)) {
      return result.then((data) => ok(data)).catch((raw) => err(toError(raw)));
    }

    return ok(result);
  } catch (raw) {
    return err(toError(raw));
  }
}

// ─── Internal Helpers ────────────────────────────────────────────────────────

/**
 * Duck typing intencional:
 * compatible con Promises cross-runtime/cross-realm.
 */
export function isPromise<T>(value: unknown): value is Promise<T> {
  return (
    value != null &&
    (typeof value === "object" || typeof value === "function") &&
    typeof (value as PromiseLike<T>).then === "function"
  );
}
