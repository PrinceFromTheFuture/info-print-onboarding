declare const getAdminDashboardData: import("@trpc/server").TRPCQueryProcedure<{
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
export default getAdminDashboardData;
//# sourceMappingURL=getAdminDashboardData.d.ts.map