import { TRPCError } from "@trpc/server";
import { privateProcedure } from "../trpc.js";
import { getPayload } from "src/db/getPayload.js";
import { z } from "zod";
const getUserTickets = privateProcedure.input(z.object({ userId: z.string().optional() })).query(async ({ ctx, input }) => {
  const payload = await getPayload;

  //admins can get all tickets spefied by user as opesed to normal users who can only get their own tickets
  if (ctx.user?.role !== "admin" && input.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "You must be an admin to get this tickets" });
  }
  const userId = input.userId || ctx.user?.id;

  if (!userId) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "You must be logged in to get your tickets" });
  }
  const tickets = await payload.find({
    collection: "tickets",
    where: {
      createdBy: {
        equals: userId,
      },
    },
    depth: 3,
    pagination: false,
  });

  const messages = await payload.find({
    collection: "messages",
    where: {
      ticket: {
        equals: tickets.docs.map((ticket) => ticket.id),
      },
    },
    pagination: false,
    depth: 4,
  });
  const filledTickets = tickets.docs.map((ticket) => {
    return {
      ...ticket,
      messages: messages.docs.filter((message) => message.ticket === ticket.id),
    };
  });

  return filledTickets;
});
export default getUserTickets;
