"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, MessageSquare, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Ticket } from "../types";

interface TicketListProps {
  tickets: Ticket[];
  selectedTicket: string | null;
  onSelectTicket: (id: string) => void;
}

// Local component for ticket item
interface TicketTriggerProps {
  ticket: Ticket;
  isSelected: boolean;
  onSelect: () => void;
}

function TicketTrigger({ ticket, isSelected, onSelect }: TicketTriggerProps) {
  return (
    <Card className={cn("py-0 bg-sidebar cursor-pointer hover:bg-accent transition-colors", isSelected && "bg-accent")} onClick={onSelect}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-medium text-sm line-clamp-2 flex-1">{ticket.subject}</h3>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{ticket.messages[0]?.content || ""}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {ticket.updatedAt}
          </div>
          <Badge variant="secondary" className="text-xs">
            {ticket.messages.length} {ticket.messages.length === 1 ? "message" : "messages"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

// Empty state component
interface EmptyStateProps {
  icon: typeof MessageSquare;
  message: string;
}

function EmptyState({ icon: Icon, message }: EmptyStateProps) {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <Icon className="h-12 w-12 mx-auto mb-2 opacity-50" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function TicketList({ tickets, selectedTicket, onSelectTicket }: TicketListProps) {
  const openTickets = tickets.filter((t) => t.status === "open");
  const resolvedTickets = tickets.filter((t) => t.status === "resolved");

  return (
    <Card className="h-[calc(100vh-200px)] bg-sidebar/50 lg:h-[calc(100vh-250px)]">
      <CardHeader className="pb-3">
        <Tabs defaultValue="open" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="open">Open ({openTickets.length})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved ({resolvedTickets.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="open" className="mt-4">
            <ScrollArea className="h-[calc(100vh-350px)] lg:h-[calc(100vh-400px)]">
              <div className="space-y-2 pr-4">
                {openTickets.length === 0 ? (
                  <EmptyState icon={MessageSquare} message="No open tickets" />
                ) : (
                  openTickets.map((ticket) => (
                    <TicketTrigger
                      key={ticket.id}
                      ticket={ticket}
                      isSelected={selectedTicket === ticket.id}
                      onSelect={() => onSelectTicket(ticket.id)}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="resolved" className="mt-4">
            <ScrollArea className="h-[calc(100vh-350px)] lg:h-[calc(100vh-400px)]">
              <div className="space-y-2 pr-4">
                {resolvedTickets.length === 0 ? (
                  <EmptyState icon={CheckCircle2} message="No resolved tickets" />
                ) : (
                  resolvedTickets.map((ticket) => (
                    <TicketTrigger
                      key={ticket.id}
                      ticket={ticket}
                      isSelected={selectedTicket === ticket.id}
                      onSelect={() => onSelectTicket(ticket.id)}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardHeader>
    </Card>
  );
}

function getStatusConfig(status: string) {
  const configs = {
    open: {
      label: "Open",
      className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    },
    resolved: {
      label: "Resolved",
      className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    },
    closed: {
      label: "Closed",
      className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    },
  };
  return configs[status as keyof typeof configs];
}
