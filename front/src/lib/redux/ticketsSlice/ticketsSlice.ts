import type { inferProcedureOutput } from "@trpc/server";
import { AppRouter } from "../../../../../back/dist/src/trpc";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { trpcClient } from "@/lib/trpc-client";
import { RootState } from "../store";
import { Message, Ticket } from "../../../../../back/payload-types";
import { useAppSelector } from "../hooks";

type AllTickets = inferProcedureOutput<AppRouter["ticketsRouter"]["getAllTickets"]>;

export const getAllTicketsAsyncThunk = createAsyncThunk<AllTickets, void>("tickets/getAllTickets", async () => {
  const tickets = await trpcClient.ticketsRouter.getAllTickets.query({ status: "open" });
  return tickets;
});

export const updateTicketAsyncThunk = createAsyncThunk<
  { ticketId: string; title?: string; description?: string; priority?: "low" | "medium" | "high"; status?: "open" | "closed" },
  { ticketId: string; title?: string; description?: string; priority?: "low" | "medium" | "high"; status?: "open" | "closed" }
>("tickets/updateTicket", async ({ ticketId, title, description, priority, status }) => {
  await trpcClient.ticketsRouter.updateTicket.mutate({ ticketId, priority, description, status, title });
  return { ticketId, title, description, priority, status };
});

interface initialState {
  tickets: AllTickets;
  isLoading: boolean;
  error: string | null;
  activeTicketId: string | null;
}
const initialState: initialState = {
  tickets: [],
  activeTicketId: null,
  isLoading: false,
  error: null,
};
const ticketsSlice = createSlice({
  name: "tickets",
  initialState,
  reducers: {
    addMessageToTicket: (state, action: PayloadAction<Message>) => {
      state.tickets
        .find((ticket) => ticket.id === (action.payload.ticket as Ticket).id)
        ?.messages.push({
          createdAt: new Date().toISOString(),
          id: action.payload.id,
          content: action.payload.content,
          sentBy: action.payload.sentBy,
          sentTo: action.payload.sentTo,
          attachments: [],
          seen: false,
          updatedAt: new Date().toISOString(),
          ticket: (action.payload.ticket as Ticket).id,
        });
    },

    onSelectTicket: (state, action: PayloadAction<{ ticketId: string }>) => {
      state.tickets.find((ticket) => ticket.id === action.payload.ticketId)!.messages.forEach((message) => (message.seen = true));
      state.activeTicketId = action.payload.ticketId;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllTicketsAsyncThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllTicketsAsyncThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tickets = action.payload;
      })
      .addCase(getAllTicketsAsyncThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch tickets";
      });

    builder.addCase(updateTicketAsyncThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload.title) {
        state.tickets.find((ticket) => ticket.id === action.payload.ticketId)!.title = action.payload.title;
      }
      if (action.payload.description) {
        state.tickets.find((ticket) => ticket.id === action.payload.ticketId)!.description = action.payload.description;
      }
      if (action.payload.priority) {
        state.tickets.find((ticket) => ticket.id === action.payload.ticketId)!.priority = action.payload.priority;
      }
      if (action.payload.status) {
        state.tickets.find((ticket) => ticket.id === action.payload.ticketId)!.status = action.payload.status;
      }
    });
  },
});
export const ticketsReducer = ticketsSlice.reducer;

export const addMessageToTicketAction = ticketsSlice.actions.addMessageToTicket;
export const onSelectTicketAction = ticketsSlice.actions.onSelectTicket;

export const allTicketsSelector = (state: RootState) => state.tickets.tickets;
export const ticketSliceSelector = (state: RootState) => state.tickets;
export const activeTicketSelector = (state: RootState) => state.tickets.tickets.find((ticket) => ticket.id === state.tickets.activeTicketId) || null;
