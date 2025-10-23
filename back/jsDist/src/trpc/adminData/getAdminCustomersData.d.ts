declare const getAdminCustomersData: import("@trpc/server").TRPCQueryProcedure<{
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
export default getAdminCustomersData;
//# sourceMappingURL=getAdminCustomersData.d.ts.map