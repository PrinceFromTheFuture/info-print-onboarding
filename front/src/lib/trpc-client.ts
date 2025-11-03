import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../../back/dist/src/trpc/index.js";
import { ROUTES } from "@/lib/routes";

// Create a singleton tRPC client that can be used outside of React components
export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: ROUTES.api.baseUrl + ROUTES.api.trpc.base,
      fetch: (input, init?) => {
        return fetch(input, {
          ...init,
          credentials: "include", // <--- include credentials like cookies
        });
      },
    }),
  ],
});
