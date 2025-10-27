"use client";

import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { Auth } from "../../../../back/jsDist/src/auth.d";
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<Auth>()],
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL ,
  fetchOptions: {
    redirect: "manual",
  },
});

export const { useSession } = authClient;
