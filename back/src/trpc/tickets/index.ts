import { router } from "../trpc.js";
import createTicket from "./createTicket.js";
import getAllTickets from "./getAdminTickets.js";
import getUserTickets from "./getUserTickets.js";
import listenToAllTicketMessages from "./listenToAllTicketMessages.js";
import listenToTicketMessages from "./listenToTicketMessages.js";
import notifySeenMessages from "./notifySeenMessages.js";
import sendTicketMessage from "./sendTicketMessage.js";
import updateTicket from "./updateTicket.js";

const ticketsRouter = router({
  getAllTickets,
  getUserTickets,
  sendTicketMessage,
  listenToTicketMessages,
  createTicket,
  notifySeenMessages,
  listenToAllTicketMessages,
  updateTicket,
});
export default ticketsRouter;
