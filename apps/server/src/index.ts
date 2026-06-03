import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";

import { createContext } from "@fludge/api/context";
import { appRouter } from "@fludge/api/routers/index";
import { auth, PUBLIC_ENDPOINTS } from "@fludge/auth";
import { env } from "@fludge/env/server";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";

const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(error);
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
    const { request, status } = context;
    if (["POST", "GET"].includes(request.method)) {
      const url = new URL(request.url);
      const authSubPath = url.pathname.replace("/api/auth", "");

      console.log({ authSubPath });

      if (!PUBLIC_ENDPOINTS.includes(authSubPath)) {
        return new Response("Not Found", { status: 404 });
      }

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
  });
