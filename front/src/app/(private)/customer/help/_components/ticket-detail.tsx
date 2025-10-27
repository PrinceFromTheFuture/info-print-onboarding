"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Calendar, Send, Paperclip, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Ticket, Message } from "@/app/(private)/customer/help/types";

interface TicketDetailProps {
  ticket: Ticket;
  newMessage: string;
  onMessageChange: (value: string) => void;
  onSendMessage: () => void;
  onClose: () => void;
  isMobile?: boolean;
}

export function TicketDetail({ ticket, newMessage, onMessageChange, onSendMessage, onClose, isMobile = false }: TicketDetailProps) {
  const statusConfig = getStatusConfig(ticket.status);

  return (
    <Card className={cn("flex flex-col", isMobile ? "h-full" : "h-[calc(100vh-200px)] lg:h-[calc(100vh-250px)]")}>
      {!isMobile && (
        <CardHeader className="border-b">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-lg line-clamp-2">{ticket.subject}</CardTitle>
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="secondary" className={statusConfig.className}>
                  {statusConfig.label}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  #{ticket.id}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Created {ticket.createdAt}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Updated {ticket.updatedAt}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      )}

      {isMobile && (
        <div className="p-4 border-b">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="secondary" className={statusConfig.className}>
              {statusConfig.label}
            </Badge>
            <Badge variant="outline" className="text-xs">
              #{ticket.id}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Created {ticket.createdAt}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Updated {ticket.updatedAt}
            </div>
          </div>
        </div>
      )}
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {ticket.messages.map((message: Message) => (
              <div key={message.id} className={cn("flex gap-3", message.isCustomer ? "flex-row-reverse" : "flex-row")}>
                <Avatar className={cn("h-8 w-8 shrink-0", message.isCustomer && "bg-primary text-primary-foreground")}>
                  <AvatarFallback>{message.author[0]}</AvatarFallback>
                </Avatar>
                <div className={cn("flex-1 min-w-0", message.isCustomer && "items-end flex flex-col")}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{message.author}</span>
                    <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                  </div>
                  <div
                    className={cn(
                      "rounded-lg p-3 max-w-[85%] lg:max-w-[70%]",
                      message.isCustomer ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Type your message..."
              rows={2}
              value={newMessage}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onMessageChange(e.target.value)}
              className="min-h-[60px]"
            />
            <div className="flex flex-col gap-2">
              <Button size="icon" variant="outline">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button onClick={onSendMessage} disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
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
