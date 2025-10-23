"use client";

import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { Auth } from "../../../../back/jsDist/src/auth.d";
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<Auth>()],
  baseURL: "http://localhost:3005",
  fetchOptions: {
    redirect: "manual",
  },
});

export const { useSession } = authClient;
