"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Calendar, Ticket, ChevronRight, ExternalLink, StickyNote } from "lucide-react";
import type { Conversation, Customer } from "./types";
import { CustomerDetailDialog } from "@/components/customer-detail-dialog";
import { useAppSelector } from "@/lib/redux/hooks";
import { activeTicketSelector } from "@/lib/redux/ticketsSlice/ticketsSlice";
import { AppUser } from "../../../../../../../../back/payload-types";
import { getInitials } from "@/lib/utils";

export function CustomerDetailsSidebar() {
  const selectedTicket = useAppSelector(activeTicketSelector);

  const [open, setOpen] = useState(false);
  if (!selectedTicket) {
    return (
      <div className="h-full flex flex-col bg-sidebar rounded-xl w-full p-5">
        <div className="flex items-center flex-col justify-center h-full text-muted-foreground">
          <div className="flex items-center mb-2 justify-center bg-primary/10 rounded-full p-4 h-14 w-14">
            <StickyNote className="h-7 w-7  text-primary" />
          </div>{" "}
          <p className="text-xs">No Selected Ticket</p>
        </div>
      </div>
    );
  }

  const user = selectedTicket.createdBy as AppUser;

  // Get all previous tickets for this customer
  const previousTickets = [] as any[];

  const handleExpandCustomer = () => {
    setOpen(true);
  };

  return (
    <div className="h-full flex flex-col bg-sidebar rounded-xl w-full overflow-hidden">
      <ScrollArea className="flex-1 h-0">
        <div className="p-5 py-0 space-y-5">
          {/* Customer Details Section */}
          <Card className="bg-transparent border-0 shadow-none">
            <CardHeader className="p-0 pb-3.5">
              <CardTitle className="text-sm font-semibold">Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-3.5">
              {/* Customer Avatar and Name */}
              <div className="  gap-2.5 w-full flex flex-col items-center justify-center mb-3.5 ">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-sm bg-primary/10 text-primary">{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <Separator />

              {/* Customer Info */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Customer Name</p>
                    <p className="text-sm font-medium">{user.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Ticket className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total Tickets</p>
                    <p className="text-sm font-medium">{previousTickets.length + 1}</p>
                  </div>
                </div>
              </div>

              <CustomerDetailDialog customerId={user.id} open={open} onOpenChange={setOpen} availableTemplates={[]} />
              <Button variant="outline" className="w-full mt-3.5 h-9 text-xs" onClick={handleExpandCustomer}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Full Customer Profile
              </Button>
            </CardContent>
          </Card>

          <Separator />

          {/* Previous Tickets Section */}
          <Card className="bg-transparent border-0 shadow-none">
            <CardHeader className="p-0 pb-3.5">
              <CardTitle className="text-sm font-semibold">Previous Tickets</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {previousTickets.length} {previousTickets.length === 1 ? "ticket" : "tickets"}
              </p>
            </CardHeader>
            <CardContent className="p-0">
              {previousTickets.length === 0 ? (
                <div className="text-center py-7 text-muted-foreground">
                  <Ticket className="h-7 w-7 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No previous tickets</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {previousTickets.map((ticket) => (
                    <Card key={ticket.id} className="bg-transparent border transition-colors hover:bg-primary/5 cursor-pointer p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{ticket.title}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{ticket.lastMessage}</p>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{ticket.lastMessageTime}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {ticket.status === "resolved" ? (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 px-1.5 py-0">
                              Resolved
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 px-1.5 py-0">
                              Open
                            </Badge>
                          )}
                          {ticket.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs px-1.5 py-0">
                              {ticket.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
