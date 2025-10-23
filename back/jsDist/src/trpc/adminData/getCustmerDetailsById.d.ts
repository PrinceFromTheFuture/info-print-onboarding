type Template = {
    id: string;
    name: string;
};
type Submission = {
    id: string;
    template: string;
    templateId: string;
    progress: number;
    completedAt: string | null;
    totalQuestions: number;
    answeredQuestions: number;
};
type MediaFile = {
    id: string;
    name: string;
    type: string;
    uploadedAt: string;
};
type Customer = {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    assignedTemplates: Template[];
    onboardingProgress: number;
    submissions: Submission[];
    media: MediaFile[];
};
declare const getCustomerDetailsById: import("@trpc/server").TRPCQueryProcedure<{
    input: string;
    output: Customer;
    meta: object;
}>;
export default getCustomerDetailsById;
//# sourceMappingURL=getCustmerDetailsById.d.ts.map