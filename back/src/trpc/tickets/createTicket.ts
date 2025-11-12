import { privateProcedure } from "../trpc.js";
import { z } from "zod";
import { getPayload } from "../../db/getPayload.js";
import { Notifier } from "../../lib/notifier.js";
import { publishTicketMessage } from "../../lib/eventEmitter.js";
import { TICKET_ACKNOWLEDGMENT_MESSAGE } from "../../lib/ticketConstants.js";
import type { BasePayload } from "payload";

const getTicketURL = (ticketId: string) => {
  return `http://localhost:3000/admin/support/${ticketId}`;
};

const sendAcknowledgmentMessage = async ({ userId, ticketId }: { userId: string; ticketId: string }, payload: BasePayload) => {
  // Find an admin user to send the acknowledgment message
  const { docs: admins } = await payload.find({
    collection: "appUsers",
    where: {
      role: {
        equals: "admin",
      },
    },
    limit: 1,
    depth: 1,
  });

  // Create an automatic acknowledgment message from admin after delay
  if (admins.length > 0) {
    const adminUser = admins[0];

    // Delay both message creation and event emission
    setTimeout(async () => {
      const acknowledgmentMessage = await payload.create({
        collection: "messages",
        depth: 1,
        data: {
          content: TICKET_ACKNOWLEDGMENT_MESSAGE,
          sentBy: adminUser.id,
          sentTo: userId,
          ticket: ticketId,
          seen: false,
        },
      });

      // Publish the message to the event emitter so it appears in real-time
      publishTicketMessage(ticketId, acknowledgmentMessage);
    }, 8000);
  }
};
const createTicket = privateProcedure.input(z.object({ title: z.string(), description: z.string() })).mutation(async ({ ctx, input }) => {
  const { title, description } = input;
  const payload = await getPayload;

  const ticket = await payload.create({
    collection: "tickets",
    data: {
      title,
      description,
      createdBy: ctx.user!.id,
      priority: "low",
      status: "open",
    },
  });

  sendAcknowledgmentMessage({ userId: ctx.user!.id, ticketId: ticket.id }, payload);

  await Notifier(
    `🎫 *New Ticket Created*\n\n` +
      `📋 *Subject:* ${title}\n` +
      `📝 *Description:* ${description}\n\n` +
      `👤 *Customer Details:*\n` +
      `   • Name: ${ctx.user!.name}\n` +
      `   • Email: ${ctx.user!.email}\n\n` +
      `🔗 *Ticket URL:* ${getTicketURL(ticket.id)}\n\n`,
    "tickets"
  );

  return ticket;
});
export default createTicket;
