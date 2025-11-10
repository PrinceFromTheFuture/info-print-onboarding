import { getPayload } from "../../db/getPayload.js";

import { privateProcedure } from "../trpc.js";
import { z } from "zod";

const notifySeenMessages = privateProcedure.input(z.object({ ticketId: z.string() })).mutation(async ({ ctx, input }) => {
  const { ticketId } = input;
  const payload = await getPayload;
  await payload.update({
    collection: "messages",
    where: {
      ticket: { equals: ticketId },
      seen: { equals: false },
      sentTo: { equals: ctx.user?.id },
    },
    data: {
      seen: true,
    },
  });
  return { success: true };
});
export default notifySeenMessages;
