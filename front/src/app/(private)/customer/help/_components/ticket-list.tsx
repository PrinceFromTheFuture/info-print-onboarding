"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  CheckCircle2,
  Ticket as TicketIcon,
  Clock,
  MessageCircle,
  CircleDot,
} from "lucide-react";
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
  const lastMessage = ticket.messages[ticket.messages.length - 1];

  return (
    <Card
      className={cn(
        "py-0 cursor-pointer transition-all duration-200 border bg-sidebar group rounded-sm",
        isSelected
          ? "bg-accent border-primary  ring-1 ring-primary/20"
          : "bg-card hover:bg-accent/50 hover:border-accent-foreground/20"
      )}
      onClick={onSelect}
    >
      <CardContent className="p-2.5">
        <div className="flex items-start gap-2 mb-1.5">
          <div
            className={cn(
              "mt-0.5 shrink-0 p-1 rounded-xs",
              isSelected
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground group-hover:bg-accent"
            )}
          >
            <TicketIcon className="h-3 w-3" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={cn("font-medium text-xs line-clamp-2 mb-1", isSelected && "text-foreground")}>
              {ticket.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-1 leading-snug">
              {lastMessage?.content || ticket.description || "No description"}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t">
          <Badge
            variant={ticket.status === "open" ? "default" : "secondary"}
            className="text-xs flex items-center gap-1 h-5 px-1.5"
          >
            {ticket.status === "open" ? (
              <CircleDot className="h-2 w-2 fill-current" />
            ) : (
              <CheckCircle2 className="h-2 w-2" />
            )}
            {ticket.status === "open" ? "Open" : "Closed"}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MessageCircle className="h-2.5 w-2.5" />
            <span>{ticket.messages.length}</span>
          </div>
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
    <div className="text-center py-6 text-muted-foreground">
      <Icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
      <p className="text-xs">{message}</p>
    </div>
  );
}

export function TicketList({ tickets, selectedTicket, onSelectTicket }: TicketListProps) {
  const openTickets = tickets.filter((t) => t.status === "open");
  const closedTickets = tickets.filter((t) => t.status === "closed");

  return (
    <div className="h-full flex flex-col bg-sidebar/50">
      <Card className="h-full flex flex-col border-0 bg-transparent shadow-none">
        <Tabs defaultValue="open" className="w-full h-full flex flex-col">
          <CardHeader className="flex-shrink-0 pb-2 pt-3 px-3 border-b">
            <TabsList className="grid w-full grid-cols-2 h-9">
              <TabsTrigger value="open" className="flex items-center gap-1.5 text-xs">
                <CircleDot className="h-3 w-3" />
                Open ({openTickets.length})
              </TabsTrigger>
              <TabsTrigger value="closed" className="flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="h-3 w-3" />
                Closed ({closedTickets.length})
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
            <TabsContent
              value="open"
              className="mt-0 flex-1 flex flex-col overflow-hidden data-[state=active]:flex"
            >
              <ScrollArea className="flex-1">
                <div className="space-y-1.5 pr-3 pt-3 pb-3 px-3">
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
            <TabsContent
              value="closed"
              className="mt-0 flex-1 flex flex-col overflow-hidden data-[state=active]:flex"
            >
              <ScrollArea className=" overflow-y-scroll ">
                <div className="space-y-1.5 pr-3 pt-3 pb-3 px-3">
                  {closedTickets.length === 0 ? (
                    <EmptyState icon={CheckCircle2} message="No closed tickets" />
                  ) : (
                    closedTickets.map((ticket) => (
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
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
