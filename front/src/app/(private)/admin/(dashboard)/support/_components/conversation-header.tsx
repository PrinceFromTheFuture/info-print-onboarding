"use client";

import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { CircleCheckBig } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { activeTicketSelector, updateTicketAsyncThunk } from "@/lib/redux/ticketsSlice/ticketsSlice";
import { AppUser } from "../../../../../../../../back/payload-types";
import { getInitials } from "@/lib/utils";

type TicketPriority = "low" | "medium" | "high";
type TicketStatus = "open" | "closed";

const getPriorityLabel = (priority: TicketPriority): string => {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
};

export function ConversationHeader() {
  const dispatch = useAppDispatch();
  const selectedTicket = useAppSelector(activeTicketSelector);

  if (!selectedTicket) {
    return null;
  }

  const handlePriorityChange = useCallback(
    (priority: TicketPriority) => {
      dispatch(updateTicketAsyncThunk({ ticketId: selectedTicket.id, priority }));
    },
    [dispatch, selectedTicket.id]
  );

  const handleToggleTicketStatus = useCallback(() => {
    const newStatus: TicketStatus = selectedTicket.status === "open" ? "closed" : "open";
    dispatch(updateTicketAsyncThunk({ ticketId: selectedTicket.id, status: newStatus }));
  }, [dispatch, selectedTicket.id, selectedTicket.status]);

  const createdBy = selectedTicket.createdBy as AppUser;
  const priorityColorMap: Record<TicketPriority, string> = {
    high: "bg-red-500",
    medium: "bg-yellow-500",
    low: "bg-green-500",
  };
  const currentPriority = selectedTicket.priority as TicketPriority;

  return (
    <div className="p-6 border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarFallback className="text-sm bg-primary/10 text-primary font-semibold">
              {getInitials(createdBy.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <h3 className="text-base font-semibold tracking-tight truncate">{selectedTicket.title}</h3>
              <Select value={selectedTicket.priority} onValueChange={handlePriorityChange}>
                <SelectTrigger className="h-7 border-border/50 px-2.5 py-0.5 text-xs w-fit bg-background/50">
                  <SelectValue>
                    <span className="flex items-center gap-1.5">
                      <div className={`h-2 w-2 rounded-full ${priorityColorMap[currentPriority]}`} />
                      {getPriorityLabel(selectedTicket.priority)}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      High Priority
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-yellow-500" />
                      Medium Priority
                    </div>
                  </SelectItem>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      Low Priority
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground">{createdBy.name}</p>
              <span className="text-muted-foreground/50">•</span>
              <p className="text-xs text-muted-foreground truncate">{createdBy.email}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {selectedTicket.status === "open" ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="default" size="sm" className="gap-2">
                  <CircleCheckBig className="h-4 w-4" />
                  Close Ticket
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to close this ticket?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Closing this ticket will prevent further messages from being sent. You can reopen it later
                    if needed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleToggleTicketStatus}>Close Ticket</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Button variant="outline" onClick={handleToggleTicketStatus} size="sm" className="gap-2">
              <CircleCheckBig className="h-4 w-4" />
              Reopen Ticket
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
