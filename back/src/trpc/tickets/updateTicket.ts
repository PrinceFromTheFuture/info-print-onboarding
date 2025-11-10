import { z } from "zod";
import { privateProcedure } from "../trpc.js";
import { getPayload } from "../../db/getPayload.js";

const updateTicket = privateProcedure
  .input(
    z.object({
      ticketId: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      priority: z.enum(["low", "medium", "high"]).optional(),
      status: z.enum(["open", "closed"]).optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { ticketId, title, description, priority, status } = input;
    const payload = await getPayload;
    await payload.update({
      collection: "tickets",
      where: { id: { equals: ticketId } },
      data: { title, description, priority, status },
    });
    return { success: true };
  });
export default updateTicket;
