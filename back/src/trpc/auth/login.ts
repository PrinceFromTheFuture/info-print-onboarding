import { publicProcedure } from "../trpc.js";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { auth } from "../../auth.js";
import { getPayload } from "../../db/getPayload.js";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

const login = publicProcedure.input(loginSchema).mutation(async ({ ctx, input }) => {
  const payload = await getPayload;

  // Find user by authEmail
  const { docs: users } = await payload.find({
    collection: "appUsers",
    where: { email: { equals: input.email } },
    pagination: false,
  });

  if (users.length === 0) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid email or password. Please try again.",
    });
  }

  const user = users[0];

  // Authenticate with better-auth using authEmail
  // signInEmail sets the session cookie automatically via the response object
  try {
    const signInResult = await auth.api.signInEmail({
        returnHeaders: true,
      body: {
        email: user.authEmail,
        password: input.password,
      },
    });
    ctx.res.setHeader("Set-Cookie", signInResult.headers.get("Set-Cookie") || "");
   

    // Return user data from payload (with regular email field, not authEmail)
    // The session is managed by better-auth via cookies, so we don't need to return it
    return {
      user: {
        ...user,
        email: user.email, // Return the display email, not authEmail
      },
    };
  } catch (error: any) {
    // If it's already a TRPCError, re-throw it
    if (error instanceof TRPCError) {
      throw error;
    }
    // Otherwise, wrap it
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: error?.message || "Invalid email or password. Please try again.",
    });
  }
});

export default login;
