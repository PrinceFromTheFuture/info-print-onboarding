import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../../back/dist/src/trpc/index.js";

// Create a singleton tRPC client that can be used outside of React components
export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: process.env.NEXT_PUBLIC_BACKEND_URL + "/trpc",
      fetch: (input, init?) => {
        return fetch(input, {
          ...init,
          credentials: "include", // <--- include credentials like cookies
        });
      },
    }),
  ],
});
