"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus } from "lucide-react";

interface EmptyStateProps {
  onCreateTicket: () => void;
}

export function EmptyState({ onCreateTicket }: EmptyStateProps) {
  return (
    <Card className="h-[calc(100vh-200px)] lg:h-[calc(100vh-250px)] flex items-center justify-center">
      <div className="text-center max-w-sm">
        <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No ticket selected</h3>
        <p className="text-muted-foreground mb-4">Select a ticket from the list to view its details</p>
        <Button onClick={onCreateTicket}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Ticket
        </Button>
      </div>
    </Card>
  );
}
