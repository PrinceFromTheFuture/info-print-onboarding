import { getPayload } from "../../db/getPayload.js";
import { publicProcedure } from "../trpc.js";
import { z } from "zod";
const clientSignUp = publicProcedure
  .input(
    z.object({
      email: z.string(),
      name: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { email, name } = input;
    const payload = await getPayload;
    const user = await payload.create({
      collection: "appUsers",
      data: { email, name, role: "customer", isApproved: false },
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
export default clientSignUp;
