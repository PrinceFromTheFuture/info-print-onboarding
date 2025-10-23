export declare const auth: import("better-auth").Auth<{
    user: {
        additionalFields: {
            name: {
                type: "string";
                input: false;
            };
            role: {
                type: "string";
                input: false;
            };
            assignedTemplates: {
                type: "string";
                input: false;
            };
        };
    };
    emailAndPassword: {
        enabled: true;
    };
    trustedOrigins: string[];
    hooks: {
        after: (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<void>;
    };
    database: (options: import("better-auth").BetterAuthOptions) => import("@better-auth/core/db/adapter").DBAdapter<import("better-auth").BetterAuthOptions>;
}>;
export type Auth = typeof auth;
//# sourceMappingURL=auth.d.ts.map