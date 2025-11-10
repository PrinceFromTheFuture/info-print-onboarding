"use client";

import React from "react";
import { useAppSelector } from "@/lib/redux/hooks";
import { activeTicketSelector } from "@/lib/redux/ticketsSlice/ticketsSlice";
import { EmptyState } from "./empty-state";
import { ConversationHeader } from "./conversation-header";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";


export default function ConversationChat() {
  const selectedTicket = useAppSelector(activeTicketSelector);
  const hasSelectedTicket = Boolean(selectedTicket);

  if (!hasSelectedTicket) {
    return (
      <div className="flex-1 flex flex-col min-w-0">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full bg-background">
      <div className="flex flex-col h-full">
        <ConversationHeader />
        <div className="flex-1 relative flex flex-col overflow-hidden min-h-0">
          <MessageList />
          <MessageInput />
        </div>
      </div>
    </div>
  );
}
