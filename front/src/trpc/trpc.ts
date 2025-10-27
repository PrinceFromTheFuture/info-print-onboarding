import { createTRPCContext } from "@trpc/tanstack-react-query";
import type { AppRouter } from "../../../back/dist/src/trpc/index";

export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<AppRouter>();
