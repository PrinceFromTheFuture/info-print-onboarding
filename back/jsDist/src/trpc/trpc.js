import { initTRPC, TRPCError } from "@trpc/server";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth";
/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
export const createContext = async (opts) => {
    // Extract user from auth session
    const session = await auth.api.getSession({
        headers: fromNodeHeaders(opts.req.headers),
    });
    return {
        req: opts.req,
        res: opts.res,
        user: session?.user,
    };
};
const t = initTRPC.context().create();
/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;
const authMiddleware = t.middleware(async ({ ctx, next }) => {
    const res = await auth.api.getSession({ headers: fromNodeHeaders(ctx.req.headers) });
    if (!res?.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    ctx.user = res.user;
    return next({ ctx });
});
export const privateProcedure = t.procedure.use(authMiddleware);
export const adminProcedure = privateProcedure.use(t.middleware(async ({ ctx, next }) => {
    if (ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({ ctx });
}));
