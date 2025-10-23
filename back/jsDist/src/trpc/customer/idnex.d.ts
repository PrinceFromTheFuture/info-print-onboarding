declare const customerRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: {
        req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
        res: import("express").Response<any, Record<string, any>>;
        user: import("../../../payload-types").AppUser | null;
    };
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: false;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    getUserMedia: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: import("../../../payload-types").Media[];
        meta: object;
    }>;
    getUserAssignedTemplates: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: {
            assignmentId: any;
            status: any;
            templateId: string;
            templateName: string;
            templateDescription: string;
            progress: {
                completed: number;
                total: number;
                percentage: number;
            };
        }[];
        meta: object;
    }>;
}>>;
export default customerRouter;
//# sourceMappingURL=idnex.d.ts.map