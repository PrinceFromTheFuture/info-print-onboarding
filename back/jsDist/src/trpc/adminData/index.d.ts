declare const adminDataRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: {
        req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
        res: import("express").Response<any, Record<string, any>>;
        user: import("../../../payload-types").AppUser | null;
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
export default adminDataRouter;
//# sourceMappingURL=index.d.ts.map