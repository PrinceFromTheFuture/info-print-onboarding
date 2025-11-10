import type { inferProcedureOutput } from "@trpc/server";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { trpcClient } from "@/lib/trpc-client";
import { RootState } from "../store";
import { Message, Ticket } from "../../../../../back/payload-types";
import { AppRouter } from "../../../../../back/dist/src/trpc";

// Types
type AllTickets = inferProcedureOutput<AppRouter["ticketsRouter"]["getAllTickets"]>;
type TicketPriority = "low" | "medium" | "high";
type TicketStatus = "open" | "closed";

interface TicketsState {
  tickets: AllTickets;
  isLoading: boolean;
  error: string | null;
  activeTicketId: string | null;
}

interface UpdateTicketPayload {
  ticketId: string;
  title?: string;
  description?: string;
  priority?: TicketPriority;
  status?: TicketStatus;
}

// Async Thunks
export const getAllTicketsAsyncThunk = createAsyncThunk<AllTickets, void>(
  "tickets/getAllTickets",
  async () => {
    const tickets = await trpcClient.ticketsRouter.getAllTickets.query({ status: "open" });
    return tickets;
  }
);

export const updateTicketAsyncThunk = createAsyncThunk<UpdateTicketPayload, UpdateTicketPayload>(
  "tickets/updateTicket",
  async ({ ticketId, title, description, priority, status }) => {
    await trpcClient.ticketsRouter.updateTicket.mutate({ ticketId, priority, description, status, title });
    return { ticketId, title, description, priority, status };
  }
);

// Initial State
const initialState: TicketsState = {
  tickets: [],
  activeTicketId: null,
  isLoading: false,
  error: null,
};

// Slice
const ticketsSlice = createSlice({
  name: "tickets",
  initialState,
  reducers: {
    addMessageToTicket: (state, action: PayloadAction<Message>) => {
      const message = action.payload;
      const ticketId = (message.ticket as Ticket).id;
      const ticket = state.tickets.find((t) => t.id === ticketId);

      if (ticket && ticket.messages) {
        // Check if message already exists to avoid duplicates
        const messageExists = ticket.messages.some((m) => m.id === message.id);
        if (!messageExists) {
          ticket.messages.push({
            createdAt: message.createdAt || new Date().toISOString(),
            id: message.id,
            content: message.content,
            sentBy: message.sentBy,
            sentTo: message.sentTo,
            attachments: message.attachments || [],
            seen: message.seen || false,
            updatedAt: message.updatedAt || new Date().toISOString(),
            ticket: ticketId,
          });
        }
      }
    },

    selectTicket: (state, action: PayloadAction<{ ticketId: string; userId?: string }>) => {
      const ticket = state.tickets.find((t) => t.id === action.payload.ticketId);
      if (ticket && ticket.messages && action.payload.userId) {
        // Mark only messages sent to the current user as seen
        ticket.messages.forEach((message) => {
          const sentTo = message.sentTo as any;
          if (sentTo?.id === action.payload.userId) {
            message.seen = true;
          }
        });
      }
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
        // Preserve active ticket selection if it still exists
        if (state.activeTicketId && !action.payload.find((t) => t.id === state.activeTicketId)) {
          state.activeTicketId = null;
        }
      })
      .addCase(getAllTicketsAsyncThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch tickets";
      })
      .addCase(updateTicketAsyncThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTicketAsyncThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const ticket = state.tickets.find((t) => t.id === action.payload.ticketId);
        if (ticket) {
          if (action.payload.title !== undefined) {
            ticket.title = action.payload.title;
          }
          if (action.payload.description !== undefined) {
            ticket.description = action.payload.description;
          }
          if (action.payload.priority !== undefined) {
            ticket.priority = action.payload.priority;
          }
          if (action.payload.status !== undefined) {
            ticket.status = action.payload.status;
          }
        }
      })
      .addCase(updateTicketAsyncThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to update ticket";
      });
  },
});

// Reducer
export const ticketsReducer = ticketsSlice.reducer;

// Actions
export const addMessageToTicketAction = ticketsSlice.actions.addMessageToTicket;
export const onSelectTicketAction = ticketsSlice.actions.selectTicket;

// Selectors
export const allTicketsSelector = (state: RootState): AllTickets => state.tickets.tickets;
export const ticketSliceSelector = (state: RootState): TicketsState => state.tickets;
export const activeTicketSelector = (state: RootState): AllTickets[number] | null => {
  if (!state.tickets.activeTicketId) return null;
  return state.tickets.tickets.find((ticket) => ticket.id === state.tickets.activeTicketId) || null;
};
