declare const assignTempalteToUser: import("@trpc/server").TRPCMutationProcedure<{
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
export default assignTempalteToUser;
//# sourceMappingURL=assignTempalteToUser.d.ts.map