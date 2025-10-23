declare const getUserAssignedTemplates: import("@trpc/server").TRPCQueryProcedure<{
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
export default getUserAssignedTemplates;
//# sourceMappingURL=getUserAssigned.d.ts.map