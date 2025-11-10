import { createTRPCContext } from "@trpc/tanstack-react-query";
import { AppRouter } from "../../../back/dist/src/trpc";

export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<AppRouter>();
