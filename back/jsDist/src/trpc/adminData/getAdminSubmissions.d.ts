declare const getAdminSubmissions: import("@trpc/server").TRPCQueryProcedure<{
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
export default getAdminSubmissions;
//# sourceMappingURL=getAdminSubmissions.d.ts.map