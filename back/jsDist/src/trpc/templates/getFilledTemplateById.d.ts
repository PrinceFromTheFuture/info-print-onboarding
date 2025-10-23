import type { Question } from "../../../payload-types";
export declare const getFilledTemplateById: import("@trpc/server").TRPCQueryProcedure<{
    input: {
        id: string;
        userId?: string | undefined;
    };
    output: {
        sections: (string | {
            groups: (string | {
                questions: (string | {
                    answer: string | null;
                    id: string;
                    title: string;
                    order: number;
                    label?: string | null;
                    required?: boolean | null;
                    selectOptions?: {
                        value?: string | null;
                        id?: string | null;
                    }[] | null;
                    type?: ("text" | "number" | "select" | "date" | "image" | "checkbox") | null;
                    updatedAt: string;
                    createdAt: string;
                })[] | undefined;
                id: string;
                title?: string | null;
                order?: number | null;
                showIf?: {
                    question?: (string | null) | Question;
                    equalTo?: string | null;
                };
                updatedAt: string;
                createdAt: string;
            })[] | undefined;
            id: string;
            title: string;
            description: string;
            order?: number | null;
            updatedAt: string;
            createdAt: string;
        })[] | undefined;
        id: string;
        name: string;
        description?: string | null;
        updatedAt: string;
        createdAt: string;
    };
    meta: object;
}>;
//# sourceMappingURL=getFilledTemplateById.d.ts.map