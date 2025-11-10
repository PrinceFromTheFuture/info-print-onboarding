import { createTRPCClient, httpBatchLink, httpSubscriptionLink, splitLink } from "@trpc/client";
import { ROUTES } from "@/lib/routes";
import { AppRouter } from "../../../back/dist/src/trpc";

// Create a singleton tRPC client that can be used outside of React components
export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    // adds pretty logs to your console in development and logs errors in production
    splitLink({
      // uses the httpSubscriptionLink for subscriptions
      condition: (op) => op.type === "subscription",
      true: httpSubscriptionLink({
        url: ROUTES.api.baseUrl + ROUTES.api.trpc.base,
        eventSourceOptions() {
          return {
            withCredentials: true, // <---
          };
        },
      }),
      false: httpBatchLink({
        url: ROUTES.api.baseUrl + ROUTES.api.trpc.base,
        fetch: (input, init?) => {
          return fetch(input, {
            ...init,
            credentials: "include", // <--- include credentials like cookies
          });
        },
      }),
    }),
  ],
});
