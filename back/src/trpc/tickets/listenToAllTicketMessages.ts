import { onAllTicketMessages } from "src/lib/eventEmitter.js";
import { privateProcedure } from "../trpc.js";

const listenToAllTicketMessages = privateProcedure
  .subscription(async function* (opts) {
    for await (const [message] of onAllTicketMessages(opts.signal)) {
      yield message;
    }
  });

export default listenToAllTicketMessages;