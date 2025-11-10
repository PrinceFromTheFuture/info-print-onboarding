import { TRPCError } from "@trpc/server";
import { privateProcedure } from "../trpc.js";
import { getPayload } from "src/db/getPayload.js";
import { z } from "zod";
import type { Ticket } from "payload-types.js";
const getUserTickets = privateProcedure
  .input(z.object({ userId: z.string().optional() }))
  .query(async ({ ctx, input }) => {
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
          in: tickets.docs.map((ticket) => ticket.id),
        },
      },
      pagination: false,
      depth: 1,
    });
    const mappedMessages = messages.docs.map((message) => ({
      ...message,
      ticket: (message.ticket as Ticket).id,
    }));

    const filledTickets = tickets.docs.map((ticket) => {
      return {
        ...ticket,
        messages: mappedMessages
          .filter((message) => message.ticket === ticket.id)
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
      };
    });

    return filledTickets;
  });
export default getUserTickets;
