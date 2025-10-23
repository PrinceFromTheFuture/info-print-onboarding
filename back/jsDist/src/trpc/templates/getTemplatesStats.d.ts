export declare const getTemplatesStats: import("@trpc/server").TRPCQueryProcedure<{
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
export default getTemplatesStats;
//# sourceMappingURL=getTemplatesStats.d.ts.map