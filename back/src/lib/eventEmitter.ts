import { EventEmitter, on } from "events";
import type { Message } from "payload-types.js";

export const ee = new EventEmitter();
ee.setMaxListeners(100); // or 0 for unlimited, but 100 is safer
export const publishTicketMessage = (ticketId: string, message: Message) => {
  ee.emit(`ticket:message:${ticketId}`, message);
  ee.emit("ticket:all", message);
};

export const onTicketMessage = (ticketId: string, signal: AbortSignal | undefined) => {
  return on(ee, `ticket:message:${ticketId}`, {
    signal,
  }) as AsyncIterableIterator<[Message]>;
};

export const onAllTicketMessages = (signal: AbortSignal | undefined) => {
    return on(ee, `ticket:all`, {
      signal,
    }) as AsyncIterableIterator<[Message]>;
  };
  