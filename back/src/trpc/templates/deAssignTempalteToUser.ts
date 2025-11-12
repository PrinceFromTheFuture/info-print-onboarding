import { getPayload } from "../../db/getPayload.js";
import { privateProcedure } from "../trpc.js";
import { z } from "zod";
const deAssignTempalteToUser = privateProcedure
  .input(
    z.object({
      userId: z.string(),
      templateId: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { userId, templateId } = input;
    const payload = await getPayload;
    await payload.delete({
      collection: "assignments",
      where: {
        template: {
          equals: templateId,
        },
        appUser: {
          equals: userId,
        },
      },
    });
    return { success: true, message: "Template assigned to user successfully" };
  });

export default deAssignTempalteToUser;
