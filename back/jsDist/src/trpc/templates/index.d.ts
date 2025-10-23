export declare const templatesRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: {
        req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
        res: import("express").Response<any, Record<string, any>>;
        user: import("../../../payload-types").AppUser | null;
    };
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: false;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    getTemplateById: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            id: string;
        };
        output: import("../../../payload-types").Template;
        meta: object;
    }>;
    getFilledTemplateById: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            id: string;
            userId?: string | undefined;
        };
        output: {
            sections: (string | {
                groups: (string | {
                    questions: (string | {
                        answer: string | null;
                        id: string;
                        title: string;
                        order: number;
                        label?: string | null;
                        required?: boolean | null;
                        selectOptions?: {
                            value?: string | null;
                            id?: string | null;
                        }[] | null;
                        type?: ("text" | "number" | "select" | "date" | "image" | "checkbox") | null;
                        updatedAt: string;
                        createdAt: string;
                    })[] | undefined;
                    id: string;
                    title?: string | null;
                    order?: number | null;
                    showIf?: {
                        question?: (string | null) | import("../../../payload-types").Question;
                        equalTo?: string | null;
                    };
                    updatedAt: string;
                    createdAt: string;
                })[] | undefined;
                id: string;
                title: string;
                description: string;
                order?: number | null;
                updatedAt: string;
                createdAt: string;
            })[] | undefined;
            id: string;
            name: string;
            description?: string | null;
            updatedAt: string;
            createdAt: string;
        };
        meta: object;
    }>;
    getTemplatesStats: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: {
            id: string;
            name: string;
            description: string | null | undefined;
            sections: number | undefined;
            lastUpdates: string;
            assignedAndSubmitted: number;
            assigned: number;
        }[];
        meta: object;
    }>;
    assignTempalteToUser: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            userId: string;
            templateId: string;
        };
        output: {
            success: boolean;
            message: string;
        };
        meta: object;
    }>;
    getTemplates: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: import("../../../payload-types").Template[];
        meta: object;
    }>;
}>>;
//# sourceMappingURL=index.d.ts.map