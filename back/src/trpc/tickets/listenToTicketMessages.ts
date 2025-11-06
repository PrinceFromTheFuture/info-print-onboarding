import { onTicketMessage } from "src/lib/eventEmitter.js";
import { publicProcedure } from "../trpc.js";
import { z } from "zod";
import { tracked } from "@trpc/server";

const listenToTicketMessages = publicProcedure
  .input(
    z.object({
      ticketId: z.string(),
    })
  )
  .subscription(async function* (opts) {
    // listen for new events
    for await (const [message] of onTicketMessage(opts.input.ticketId, opts.signal)) {
      yield message;
    }
  });
export default listenToTicketMessages;
