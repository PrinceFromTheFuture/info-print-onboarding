import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { getPayload } from "./db/getPayload";
import { createAuthMiddleware } from "better-auth/api";
import { BasePayload } from "payload";
const signUpUser = async (payload, email, name) => {
    await payload.create({
        collection: "appUsers",
        data: {
            email,
            name: name || "New User",
            role: "customer", // Default role for new users
        },
    });
};
const getUser = async (payload, email) => {
    const { docs: users } = await payload.find({
        collection: "appUsers",
        where: { email: { equals: email } },
    });
    return users[0];
};
const payload = await getPayload; // ✅ resolved here
//@ts-ignore
const client = payload.db.connection.getClient();
const db = client.db();
export const auth = betterAuth({
    user: {
        additionalFields: {
            name: { type: "string", input: false },
            role: { type: "string", input: false },
            assignedTemplates: { type: "string", input: false },
        },
    },
    emailAndPassword: { enabled: true },
    trustedOrigins: ["http://localhost:3000", "http://localhost:3005"],
    hooks: {
        after: createAuthMiddleware(async (ctx) => {
            console.log("test");
            //@ts-ignore
            const user = ctx.context?.returned?.user;
            if (ctx.path.startsWith("/get-session")) {
                const payloadUser = await getUser(payload, user.email);
                //@ts-ignore
                ctx.context.session.user = payloadUser;
            }
        }),
    },
    database: mongodbAdapter(db, { client }),
});
