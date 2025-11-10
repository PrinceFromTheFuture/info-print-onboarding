import { getPayload } from "src/db/getPayload.js";
import { privateProcedure } from "../trpc.js";
import { z } from "zod";
import type { BasePayload } from "payload";
import dayjs from "dayjs";
import { TRPCError } from "@trpc/server";

const canUserCreateTicket = async (userId: string, payload: BasePayload) => {
  const MAX_TICKETS_PER_USER = 5;

  const userOpenTickets = await payload.find({
    collection: "tickets",
    where: {
      createdBy: { equals: userId },
      status: { equals: "open" },
    },
    pagination: false,
  });
  const ticketsInLastMonth = await payload.find({
    collection: "tickets",
    where: {
      createdBy: { equals: userId },
      createdAt: { greater_than_equal: dayjs().subtract(1, "month").toISOString() },
    },
    pagination: false,
  });
  const isUserHasMoreThanMaxTickets = ticketsInLastMonth.docs.length > MAX_TICKETS_PER_USER;
  const isUserHasOpenTicket = userOpenTickets.docs.length > 0;

  return !isUserHasMoreThanMaxTickets && !isUserHasOpenTicket;
};

const createTicket = privateProcedure.input(z.object({ title: z.string(), description: z.string() })).mutation(async ({ ctx, input }) => {
  const { title, description } = input;
  const payload = await getPayload;

  
  const isUserCanCreateTicket = await canUserCreateTicket(ctx.user!.id, payload);
  if (!isUserCanCreateTicket) {
    throw new TRPCError({ code: "FORBIDDEN", message: "You have reached the maximum number of open tickets" });
  }
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
  return ticket;
});
export default createTicket;
