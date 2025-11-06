import { getPayload } from "src/db/getPayload.js";
import { privateProcedure } from "../trpc.js";
import { z } from "zod";
import type { Ticket } from "payload-types.js";

const getAdminTickets = privateProcedure
  .input(
    z.object({
      status: z.enum(["open", "closed"]),
    })
  )
  .query(async ({ ctx, input }) => {
    const payload = await getPayload;

    const tickets = await payload.find({
      collection: "tickets",

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
    const mappedMessages = messages.docs.map((message) => ({ ...message, ticket: (message.ticket as Ticket).id }));

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
export default getAdminTickets;
