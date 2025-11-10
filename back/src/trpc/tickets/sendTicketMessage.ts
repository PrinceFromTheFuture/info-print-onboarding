import { publicProcedure } from "../trpc.js";
import { z } from "zod";
import { publishTicketMessage } from "../../lib/eventEmitter.js";
import type { AppUser, User } from "payload-types.js";
import { getPayload } from "../../db/getPayload.js";

import { TRPCError } from "@trpc/server";

const sendTicketMessage = publicProcedure
  .input(
    z.object({
      ticketId: z.string(),
      content: z.string(),
      attachments: z.array(z.string()).max(5).optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = ctx.user as AppUser;

    const payload = await getPayload;
    const ticket = await payload.findByID({
      collection: "tickets",
      id: input.ticketId,
      depth: 3,
    });

    if (!ticket) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
    }

    if (((ticket.createdBy as User).id !== user.id && user.role !== "admin") || ticket.status === "closed") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not allowed to send messages to this ticket since it is closed or you are not the creator",
      });
    }

    // Determine recipient based on sender role
    let recipientId: string;

    if (user.role === "admin") {
      // Admin sending to customer
      recipientId = (ticket.createdBy as User).id;
    } else {
      // Customer sending to admin
      const { docs: admins } = await payload.find({
        collection: "appUsers",
        where: {
          email: {
            equals: "admin@gmail.com",
          },
        },
        depth: 3,
      });
      recipientId = admins[0].id;
    }

    const message = await payload.create({
      collection: "messages",
      depth: 1,
      data: {
        content: input.content,
        sentBy: user.id,
        seen: false,
        attachments: input.attachments,
        sentTo: recipientId,
        ticket: ticket.id,
      },
    });

    // 2. PUBLISH TO ROOM
    publishTicketMessage(ticket.id, message);

    return message;
  });
export default sendTicketMessage;
