import type { TranslationKey } from "@fludge/i18n/index";

/**
 * Error de infraestructura de repositories.
 * El mensaje es una TranslationKey para que la UI pueda traducirlo,
 * y el cause preserva el error original para debugging.
 */
export class RepositoryError extends Error {
  readonly message: TranslationKey;

  constructor(message: TranslationKey, options?: { cause?: Error }) {
    super(message, options);
    this.message = message;
  }
}

/**
 * Construye un {@link RepositoryError} a partir de un error raw,
 * asegurando que el cause sea siempre una instancia de Error.
 */
export function toRepositoryError(message: TranslationKey, raw: unknown): RepositoryError {
  const cause = raw instanceof Error ? raw : new Error(String(raw));

  return new RepositoryError(message, { cause });
}
