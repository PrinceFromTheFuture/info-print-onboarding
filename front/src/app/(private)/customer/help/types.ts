import { AppRouter } from "../../../../../../back/dist/src/trpc";
import type { inferProcedureOutput } from "@trpc/server";
import type {
  Message as PayloadMessage,
  Ticket as PayloadTicket,
  AppUser,
  Media,
} from "../../../../../../back/payload-types";

export type Ticket = inferProcedureOutput<AppRouter["ticketsRouter"]["getUserTickets"]>[number];


// Extended types that match the Payload structure but with populated relationships
export interface Message extends Omit<PayloadMessage, "sentBy" | "sentTo" | "ticket" | "attachments"> {
  sentBy: AppUser;
  sentTo: AppUser;
  ticket: string | Ticket;
  attachments?: Media[] | null;
}
