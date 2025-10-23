export declare const appRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: {
        req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
        res: import("express").Response<any, Record<string, any>>;
        user: import("../../payload-types").AppUser | null;
    };
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: false;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    authRouter: import("@trpc/server").TRPCBuiltRouter<{
        ctx: {
            req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
            res: import("express").Response<any, Record<string, any>>;
            user: import("../../payload-types").AppUser | null;
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
    submittionsRouter: import("@trpc/server").TRPCBuiltRouter<{
        ctx: {
            req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
            res: import("express").Response<any, Record<string, any>>;
            user: import("../../payload-types").AppUser | null;
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
                submission: import("../../payload-types").Submission;
                action: string;
            };
            meta: object;
        }>;
    }>>;
    customerRouter: import("@trpc/server").TRPCBuiltRouter<{
        ctx: {
            req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
            res: import("express").Response<any, Record<string, any>>;
            user: import("../../payload-types").AppUser | null;
        };
        meta: object;
        errorShape: import("@trpc/server").TRPCDefaultErrorShape;
        transformer: false;
    }, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
        getUserMedia: import("@trpc/server").TRPCQueryProcedure<{
            input: void;
            output: import("../../payload-types").Media[];
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
    adminDataRouter: import("@trpc/server").TRPCBuiltRouter<{
        ctx: {
            req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
            res: import("express").Response<any, Record<string, any>>;
            user: import("../../payload-types").AppUser | null;
        };
        meta: object;
        errorShape: import("@trpc/server").TRPCDefaultErrorShape;
        transformer: false;
    }, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
        getCustomersData: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                search?: string | undefined;
            } | undefined;
            output: {
                customers: {
                    id: string;
                    name: string;
                    email: string;
                    role: "admin" | "customer" | null | undefined;
                    createdAt: string;
                    onboardingProgress: number;
                    assignedTemplates: number;
                    completedTemplates: number;
                }[];
            };
            meta: object;
        }>;
        getAdminCustomersData: import("@trpc/server").TRPCQueryProcedure<{
            input: void;
            output: {
                custmersCreationAvctivity: {
                    createAtToday: number;
                    createAtYesterday: number;
                };
                activeCustomersActivity: {
                    activeThisWeek: number;
                    activeLastWeek: number;
                };
                assignmentCompletionActivity: {
                    completionRateThisWeek: number;
                    completionRateLastWeek: number;
                };
                totalCustomers: number;
                customersDetailed: {
                    id: string;
                    name: string;
                    email: string;
                    createdAt: string;
                    assignedTemplates: number;
                    completedTemplates: number;
                }[];
            };
            meta: object;
        }>;
        getAdminDashboardData: import("@trpc/server").TRPCQueryProcedure<{
            input: void;
            output: {
                SubmitionsCreationAvctivity: {
                    createAtToday: number;
                    createAtYesterday: number;
                };
                custmersCreationAvctivity: {
                    createAtToday: number;
                    createAtYesterday: number;
                };
                tempaltesCreationAvctivity: number;
                recentSubmittedAssignmentsAvctivity: {
                    customerName: string;
                    templateName: string;
                    submitedAt: string;
                }[];
                last5UsersCreatedAvctivity: {
                    name: string;
                    email: string;
                    createdAt: string;
                    assignments: number;
                }[];
            };
            meta: object;
        }>;
        getAdminSubmissions: import("@trpc/server").TRPCQueryProcedure<{
            input: void;
            output: {
                totalSubmissionsData: {
                    total: number;
                    createdThisWeek: number;
                    createdLastWeek: number;
                    percentageChange: number;
                };
                completionRateData: {
                    totalAnswered: number;
                    totalExpectedAnswers: number;
                    completionRate: number;
                };
                assignedTemplates: {
                    assignmentId: string;
                    userId: string;
                    userEmail: string;
                    userName: string;
                    templateName: string;
                    templateId: string;
                    submissionCount: number;
                    status: "inProgress" | "submitted" | "pending" | null | undefined;
                    lastUpdatedSubmission: string | null;
                    assignmentUpdatedAt: string;
                }[];
            };
            meta: object;
        }>;
        getCustomerDetailsById: import("@trpc/server").TRPCQueryProcedure<{
            input: string;
            output: {
                id: string;
                name: string;
                email: string;
                role: string;
                createdAt: string;
                assignedTemplates: {
                    id: string;
                    name: string;
                }[];
                onboardingProgress: number;
                submissions: {
                    id: string;
                    template: string;
                    templateId: string;
                    progress: number;
                    completedAt: string | null;
                    totalQuestions: number;
                    answeredQuestions: number;
                }[];
                media: {
                    id: string;
                    name: string;
                    type: string;
                    uploadedAt: string;
                }[];
            };
            meta: object;
        }>;
    }>>;
    templatesRouter: import("@trpc/server").TRPCBuiltRouter<{
        ctx: {
            req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
            res: import("express").Response<any, Record<string, any>>;
            user: import("../../payload-types").AppUser | null;
        };
        meta: object;
        errorShape: import("@trpc/server").TRPCDefaultErrorShape;
        transformer: false;
    }, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
        getTemplateById: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                id: string;
            };
            output: import("../../payload-types").Template;
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
                            question?: (string | null) | import("../../payload-types").Question;
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
            output: import("../../payload-types").Template[];
            meta: object;
        }>;
    }>>;
    getUserMedia: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: import("../../payload-types").Media[];
        meta: object;
    }>;
    reportVisit: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            type: "mobile" | "desktop";
        };
        output: void;
        meta: object;
    }>;
    getVisitsData: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: import("../../payload-types").Visit[];
        meta: object;
    }>;
}>>;
export type AppRouter = typeof appRouter;
//# sourceMappingURL=index.d.ts.map