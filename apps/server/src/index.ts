import { cors } from "@elysiajs/cors";
import { createContext } from "@fludge/api/context";
import { ValidationDomainException } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import { appRouter } from "@fludge/api/routers/index";
import { auth, isAvailableEndpoint } from "@fludge/auth";
import { env } from "@fludge/env/server";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError, ORPCError, ValidationError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { Elysia } from "elysia";

const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      if (
        error instanceof ORPCError &&
        error.code === "BAD_REQUEST" &&
        error.cause instanceof ValidationError
      ) {
        throw new ValidationDomainException(error.cause);
      }
    }),
  ],
});
const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

new Elysia()
  .use(
    cors({
      origin: env.CORS_ORIGIN,
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }),
  )
  .all("/api/auth/*", async (context) => {
    const isAvailable = isAvailableEndpoint(context.request.url);
    if (!isAvailable)
      return context.status(404, {
        message: "Endpoint no disponible",
      });

    const { request, status } = context;
    if (["POST", "GET"].includes(request.method)) {
      return auth.handler(request);
    }
    return status(405);
  })
  .all(
    "/rpc*",
    async (context) => {
      const { response } = await rpcHandler.handle(context.request, {
        prefix: "/rpc",
        context: await createContext({ context }),
      });
      return response ?? new Response("Not Found", { status: 404 });
    },
    {
      parse: "none",
    },
  )
  .all(
    "/api-rpc*",
    async (context) => {
      const { response } = await apiHandler.handle(context.request, {
        prefix: "/api-rpc",
        context: await createContext({ context }),
      });
      return response ?? new Response("Not Found", { status: 404 });
    },
    {
      parse: "none",
    },
  )
  .get("/", () => "OK")
  .listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
    console.log("Server ORPC is running on http://localhost:3000/api-rpc");
    console.log(
      "Server Better Auth is running on http://localhost:3000/api/auth/reference",
    );
  });
