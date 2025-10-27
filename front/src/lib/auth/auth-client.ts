"use client";

import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { Auth } from "../../../../back/src/auth";
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<Auth>()],
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL + "/api/auth",
  fetchOptions: {
    redirect: "manual",
  },
});

export const { useSession } = authClient;
