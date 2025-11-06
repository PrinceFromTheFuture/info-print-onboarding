import { publicProcedure } from "../trpc.js";
import { z } from "zod";
import { publishTicketMessage } from "src/lib/eventEmitter.js";
import type { AppUser, User } from "payload-types.js";
import { getPayload } from "src/db/getPayload.js";
import { TRPCError } from "@trpc/server";

const sendTicketMessage = publicProcedure
  .input(z.object({ ticketId: z.string(), content: z.string(), attachments: z.array(z.string()).max(5).optional() }))
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

    // TODO when assing tciket or added  the foolwing is onvalid

    const { docs: admins } = await payload.find({
      collection: "appUsers",

      depth: 3,
    });
    const anyAdminUser = admins[0];

    const message = await payload.create({
      collection: "messages",
      data: {
        content: input.content,
        sentBy: user.id,
        seen: false,
        attachments: input.attachments,
        sentTo: anyAdminUser.id,
        ticket: ticket.id,
      },
    });

    // Save to DB (optional but critical)
    // await db.message.create({ data: msg });

    // 2. PUBLISH TO ROOM
    publishTicketMessage(ticket.id, message);

    return message;
  });
export default sendTicketMessage;
