// packages/db/src/resilient-client.ts
import { createClient, type Client, type Config } from "@libsql/client";

function isStreamExpiredError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    (msg.includes("Stream") && msg.includes("expired")) ||
    msg.includes("STREAM_EXPIRED") ||
    msg.includes("HTTP error! status: 400")
  );
}

export function createResilientClient(config: Config): Client {
  let current = createClient(config);

  async function withRetry<T>(fn: (client: Client) => Promise<T>): Promise<T> {
    try {
      return await fn(current);
    } catch (err) {
      if (!isStreamExpiredError(err)) throw err;

      console.warn("[db] stream expirado, reconectando y reintentando...");
      try {
        current.close();
      } catch {
        /* ya estaba muerto, ignorar */
      }
      current = createClient(config);

      return fn(current); // un solo reintento, si vuelve a fallar se propaga
    }
  }

  // Proxy: cualquier acceso a client.execute(), client.batch(), etc.
  // se resuelve contra "current", que puede haber sido reemplazado.
  return new Proxy({} as Client, {
    get(_target, prop) {
      const value = (current as any)[prop];
      if (typeof value !== "function") return value;

      // Solo envolvemos operaciones seguras de reintentar (idempotentes / de un solo statement)
      if (["execute", "executeMultiple"].includes(prop as string)) {
        return (...args: unknown[]) =>
          withRetry((client) => (client as any)[prop](...args));
      }

      // batch y transaction NO se reintentan a ciegas: si fallan a medias,
      // reintentar podría duplicar escrituras. Se dejan pasar tal cual.
      return (...args: unknown[]) => (current as any)[prop](...args);
    },
  });
}
