import { auth } from "src/auth";
import { privateProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { getPayload } from "src/db/getPayload";
import { TRPCError } from "@trpc/server";

export const signUpCustomer = privateProcedure
  .input(
    z.object({
      email: z.string(),
      password: z.string(),
      name: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const payload = await getPayload;
    const { docs: users } = await payload.find({
      collection: "appUsers",
      where: {
        email: { equals: input.email },
      },
      pagination: false,
    });
    if (users.length > 0) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "User already exists" });
    }

    await payload.create({
      collection: "appUsers",
      data: {
        email: input.email,
        name: input.name,
        role: "customer",
      },
    });
    await auth.api.signUpEmail({
      body: {
        email: input.email,
        password: input.password,
        name: input.name,
      },
    });
    return { success: true };
  });
