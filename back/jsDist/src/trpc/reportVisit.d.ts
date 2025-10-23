declare const reportVisit: import("@trpc/server").TRPCMutationProcedure<{
    input: {
        type: "mobile" | "desktop";
    };
    output: void;
    meta: object;
}>;
export default reportVisit;
//# sourceMappingURL=reportVisit.d.ts.map