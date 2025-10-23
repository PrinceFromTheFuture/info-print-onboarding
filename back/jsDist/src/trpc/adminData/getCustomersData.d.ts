export declare const getCustomersData: import("@trpc/server").TRPCQueryProcedure<{
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
export default getCustomersData;
//# sourceMappingURL=getCustomersData.d.ts.map