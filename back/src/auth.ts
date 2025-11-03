import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { createAuthMiddleware } from "better-auth/api";
import { BasePayload } from "payload";
import { getPayload } from "./db/getPayload.js";

const signUpUser = async (payload: BasePayload, email: string, name?: string) => {
  await payload.create({
    collection: "appUsers",
    data: {
      isApproved: false,
      email,
      name: name || "New User",
      role: "customer", // Default role for new users
    },
  });
};

const getUser = async (payload: BasePayload, email: string) => {
  const { docs: users } = await payload.find({
    collection: "appUsers",
    where: { email: { equals: email } },
    pagination: false,
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
      isApproved: { type: "boolean", input: false },
      appUserConfig: { type: "string", input: false },
      assignedTemplates: { type: "string", input: false },
    },
  },
  emailAndPassword: { enabled: true },
  trustedOrigins: ["http://localhost:3000", "http://localhost:3001", "http://100.125.142.120:3000", "https://infoprint-onboarding.amirwais.store"],

  hooks: {
    //@ts-ignore
    after: createAuthMiddleware(async (ctx) => {
      //@ts-ignore
      const user = ctx.context?.returned?.user!;

      if (!user) return;
      if (ctx.path.startsWith("/get-session")) {
        const payloadUser = await getUser(payload, user.email);
        //@ts-ignore
        ctx.context.session.user = payloadUser;
      }
    }),
  },
  database: mongodbAdapter(db, { client }),
});

export type Auth = typeof auth;
