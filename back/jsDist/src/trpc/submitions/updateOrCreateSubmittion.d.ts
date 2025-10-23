export declare const updateOrCreateSubmission: import("@trpc/server").TRPCMutationProcedure<{
    input: {
        questionId: string;
        value: string;
    };
    output: {
        submission: import("../../../payload-types").Submission;
        action: string;
    };
    meta: object;
}>;
//# sourceMappingURL=updateOrCreateSubmittion.d.ts.map