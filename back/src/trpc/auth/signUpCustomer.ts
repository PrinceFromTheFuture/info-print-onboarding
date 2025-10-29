import { auth } from "../../auth.js";
import { privateProcedure, publicProcedure } from "../trpc.js";
import { z } from "zod";
import { getPayload } from "../../db/getPayload.js";
import { TRPCError } from "@trpc/server";

export const signUpCustomer = privateProcedure
  .input(
    z.object({
      email: z.string(),
      password: z.string(),
      name: z.string(),
    })
  )
  .mutation(async ({ input }) => {
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

    const user = await payload.create({
      collection: "appUsers",
      data: {
        email: input.email,
        name: input.name,
        role: "customer",
        isApproved: false,
      },
    });
    await auth.api.signUpEmail({
      body: {
        email: input.email,
        password: input.password,
        name: input.name,
      },
    });
    const templates = await payload.find({
      collection: "templates",
      pagination: false,
    });
    for (const template of templates.docs) {
      await payload.create({
        collection: "assignments",
        data: { appUser: user.id, template: template.id,  },
      });
    }
    return { success: true };
  });
