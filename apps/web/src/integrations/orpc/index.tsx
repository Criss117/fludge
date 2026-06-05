import { env } from "@fludge/env/web";
import { ORPCProvider as Provider } from "@fludge/client/providers/orpc.provider";

export function ORPCProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider
      options={{
        url: `${env.VITE_SERVER_URL}/rpc`,
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: "include",
          });
        },
      }}
    >
      {children}
    </Provider>
  );
}
