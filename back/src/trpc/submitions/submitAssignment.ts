import { getPayload } from "../../db/getPayload.js";
import { privateProcedure, publicProcedure } from "../trpc.js";
import { z } from "zod";
const submitAssignment = privateProcedure
  .input(
    z.object({
      templateId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const { templateId } = input;
    const payload = await getPayload;
    await payload.update({
      collection: "assignments",
      where: {
        template: { equals: templateId },
      },
      data: {
        status: "submitted",
      },
    });
    return { success: true };
  });
export default submitAssignment;
