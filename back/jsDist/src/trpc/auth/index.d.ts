declare const authRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: {
        req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
        res: import("express").Response<any, Record<string, any>>;
        user: import("../../../payload-types").AppUser | null;
    };
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: false;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    signUpCustomer: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            email: string;
            password: string;
            name: string;
        };
        output: {
            success: boolean;
        };
        meta: object;
    }>;
}>>;
export default authRouter;
//# sourceMappingURL=index.d.ts.map