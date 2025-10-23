export declare const submittionsRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: {
        req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
        res: import("express").Response<any, Record<string, any>>;
        user: import("../../../payload-types").AppUser | null;
    };
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: false;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    updateOrCreateSubmission: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            questionId: string;
            value: string;
        };
        output: {
            submission: import("../../../payload-types").Submission;
            action: string;
        };
        meta: object;
    }>;
}>>;
//# sourceMappingURL=index.d.ts.map