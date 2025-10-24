import { getPayload } from "../../db/getPayload.js";
import { privateProcedure } from "../trpc.js";
import { z } from "zod";
const assignTempalteToUser = privateProcedure
  .input(
    z.object({
      userId: z.string(),
      templateId: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { userId, templateId } = input;
    const payload = await getPayload;
    const newAssignments = await payload.create({
      collection: "assignments",
      data: {
        template: templateId,
        appUser: userId,
        status: "pending",
      },
    });
    return { success: true, message: "Template assigned to user successfully" };
  });

export default assignTempalteToUser;
