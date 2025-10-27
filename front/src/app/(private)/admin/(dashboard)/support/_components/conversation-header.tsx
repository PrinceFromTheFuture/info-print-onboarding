"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Conversation, Message } from "./types";

interface ConversationHeaderProps {
  conversation: Conversation;
  onCloseTicket: () => void;
  onArchiveTicket: () => void;
}

export function ConversationHeader({ conversation, onCloseTicket, onArchiveTicket }: ConversationHeaderProps) {
  return (
    <div className="p-4 border-b bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{conversation.title}</h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onCloseTicket}>
            {conversation.status === "open" ? "Close Ticket" : "Reopen Ticket"}
          </Button>
          {conversation.status === "open" && (
            <Button variant="outline" size="sm" onClick={onArchiveTicket}>
              {conversation.isArchived ? "Unarchive" : "Archive"}
            </Button>
          )}
          {conversation.status === "resolved" && <span className="text-sm text-muted-foreground italic">Resolved (Auto-archived)</span>}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Add Note</DropdownMenuItem>
              <DropdownMenuItem>Export Conversation</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-sm">
              {conversation.customer.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{conversation.customer.name}</p>
            <p className="text-xs text-muted-foreground">{conversation.customer.email}</p>
          </div>
        </div>
        <Separator orientation="vertical" className="h-8" />
        <div className="text-sm text-muted-foreground">Created {conversation.lastMessageTime}</div>
      </div>
    </div>
  );
}
