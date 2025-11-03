"use client";

import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { Auth } from "../../../../back/src/auth";
import { ROUTES } from "@/lib/routes";

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<Auth>()],
  baseURL: ROUTES.api.baseUrl + ROUTES.api.auth.base,
  fetchOptions: {
    redirect: "manual",
  },
});

export const { useSession } = authClient;
