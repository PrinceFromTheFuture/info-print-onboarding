"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Check, CircleCheckBig, MoreVertical, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Conversation, Message } from "./types";
import {
  activeTicketSelector,
  getAllTicketsAsyncThunk,
  invalidateActiveTicketAction,
  updateTicketAsyncThunk,
} from "@/lib/redux/ticketsSlice/ticketsSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { AppUser } from "../../../../../../../../back/payload-types";
import { getInitials } from "@/lib/utils";

export function ConversationHeader() {
  const dispatch = useAppDispatch();
  const selectedTicket = useAppSelector(activeTicketSelector);

  if (!selectedTicket) return null;
  const getPriorityLabel = (priority: "low" | "medium" | "high") => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const onPriorityChange = (priority: "low" | "medium" | "high") => {
    dispatch(updateTicketAsyncThunk({ ticketId: selectedTicket.id, priority }));
  };
  const onCloseTicket = () => {
    dispatch(updateTicketAsyncThunk({ ticketId: selectedTicket.id, status: selectedTicket.status === "open" ? "closed" : "open" }));
  };

  return (
    <div className="p-6 border-b shadow-[0_20px_25px_-5px_rgba(0,0,0,0.01),0_10px_10px_-5px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">{selectedTicket.title}</h3>
            <Select value={selectedTicket.priority} onValueChange={(value) => onPriorityChange(value as "low" | "medium" | "high")}>
              <SelectTrigger className={`h-auto border px-2 py-0.5 text-xs  w-fit`}>
                <SelectValue>
                  <span className="flex items-center gap-1.5">
                    <div
                      className={`h-1.5 w-1.5 rounded-full ${selectedTicket.priority === "high" ? "bg-red-500" : selectedTicket.priority === "medium" ? "bg-yellow-500" : "bg-green-500"}`}
                    />
                    {getPriorityLabel(selectedTicket.priority)}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent align="start">
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    High
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    Medium
                  </div>
                </SelectItem>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    Low
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="default" className="" onClick={onCloseTicket}>
            {selectedTicket.status === "open" ? "Close Ticket" : "Reopen Ticket"}
            <CircleCheckBig className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-2.5">
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-xs">{getInitials((selectedTicket.createdBy as AppUser).name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs font-medium">{(selectedTicket.createdBy as AppUser).name}</p>
            <p className="text-[11px] text-muted-foreground">{(selectedTicket.createdBy as AppUser).email}</p>
          </div>
        </div>
        <Separator orientation="vertical" className="h-7" />
      </div>
    </div>
  );
}
