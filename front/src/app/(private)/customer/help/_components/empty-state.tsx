"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus, Inbox, ArrowRight } from "lucide-react";

interface EmptyStateProps {
  onCreateTicket: () => void;
  hasOpenTicket?: boolean;
}

export function EmptyState({ onCreateTicket, hasOpenTicket = false }: EmptyStateProps) {
  return (
    <div className="h-full flex items-center justify-center bg-background">
      <Card className="border-0 shadow-none bg-transparent">
        <div className="text-center max-w-sm px-4">
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-muted/50 animate-pulse" />
            </div>
            <Inbox className="h-12 w-12 mx-auto text-muted-foreground relative z-10 opacity-60" />
          </div>
          <h3 className="text-base font-semibold mb-1.5 flex items-center justify-center gap-1.5">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            No ticket selected
          </h3>
          <p className="text-muted-foreground mb-4 text-xs leading-relaxed">
            {hasOpenTicket ? (
              <>
                You already have an open ticket. Select it from the sidebar{" "}
                <ArrowRight className="h-3 w-3 inline mx-1" /> to view details and continue the conversation.
              </>
            ) : (
              <>
                Select a ticket from the sidebar to view its details, or create a new ticket to get started.
              </>
            )}
          </p>
          <Button onClick={onCreateTicket} disabled={hasOpenTicket} size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Create New Ticket
          </Button>
          {hasOpenTicket && (
            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              <span>You can only have one open ticket at a time</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
