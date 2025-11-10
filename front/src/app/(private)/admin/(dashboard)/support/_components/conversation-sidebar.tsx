"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Archive, Clock, Search, ArrowUpDown, User, Signal, MessageSquare } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  activeTicketSelector,
  allTicketsSelector,
  onSelectTicketAction,
} from "@/lib/redux/ticketsSlice/ticketsSlice";
import { AppUser } from "../../../../../../../../back/payload-types";
import type { inferProcedureOutput } from "@trpc/server";
import { useTRPC } from "@/trpc/trpc";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "@/lib/auth/auth-client";
import { AppRouter } from "../../../../../../../../back/dist/src/trpc";

type TicketWithMessages = inferProcedureOutput<AppRouter["ticketsRouter"]["getAllTickets"]>[number];
type SortOption = "default" | "name" | "priority" | "lastSent";
type TicketPriority = "low" | "medium" | "high";
type TabType = "open" | "archived";

interface ConversationSidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

interface CustomerInfo {
  name: string;
  email: string;
  avatar: string;
}

// Helper functions
const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds !== 1 ? "s" : ""} ago`;
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
};

const getCustomerFromTicket = (ticket: TicketWithMessages): CustomerInfo => {
  const createdBy = ticket.createdBy as AppUser;
  if (typeof createdBy === "string" || !createdBy) {
    return { name: "Unknown", email: "", avatar: "" };
  }
  return {
    name: createdBy.name || "Unknown",
    email: createdBy.email || "",
    avatar: "",
  };
};

const getLastMessageTime = (ticket: TicketWithMessages): string => {
  if (!ticket.messages || ticket.messages.length === 0) {
    return formatTimeAgo(ticket.updatedAt || ticket.createdAt);
  }
  const lastMessage = ticket.messages[ticket.messages.length - 1];
  return formatTimeAgo(lastMessage.createdAt);
};

const getPriorityColor = (priority: TicketPriority): string => {
  const colorMap: Record<TicketPriority, string> = {
    high: "bg-red-500/10 text-red-600",
    medium: "bg-yellow-500/10 text-yellow-600",
    low: "bg-green-500/10 text-green-600",
  };
  return colorMap[priority] || "bg-gray-500/10 text-gray-600";
};

const getPriorityLabel = (priority: TicketPriority): string => {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
};

export function ConversationSidebar({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
}: ConversationSidebarProps) {
  const dispatch = useAppDispatch();
  const allTickets = useAppSelector(allTicketsSelector);
  const activeTicket = useAppSelector(activeTicketSelector);
  const { data: session } = useSession();
  const trpc = useTRPC();
  const { mutate: notifySeenMessages } = useMutation(trpc.ticketsRouter.notifySeenMessages.mutationOptions());

  const [sortBy, setSortBy] = useState<SortOption>("default");

  // Filter tickets by status
  const openTickets = useMemo(
    () => allTickets.filter((ticket: TicketWithMessages) => ticket.status === "open"),
    [allTickets]
  );
  const archivedTickets = useMemo(
    () => allTickets.filter((ticket: TicketWithMessages) => ticket.status === "closed"),
    [allTickets]
  );

  // Get unread count for a ticket
  const getUnreadCount = useCallback(
    (ticket: TicketWithMessages): number => {
      if (!session?.user?.id || !ticket.messages) return 0;
      return ticket.messages.filter((msg) => {
        //
        const sentTo = msg.sentTo as AppUser;
        return !msg.seen && (sentTo?.email === session.user.email || sentTo.email === "admin@admin.com");
      }).length;
    },
    [session?.user?.id]
  );

  // Handle ticket selection
  const handleSelectTicket = useCallback(
    (ticketId: string) => {
      dispatch(onSelectTicketAction({ ticketId, userId: session?.user?.id }));
      notifySeenMessages({ ticketId } as any);
    },
    [dispatch, notifySeenMessages, session?.user?.id]
  );
  // Filter and sort tickets
  const filteredTickets = useMemo(() => {
    const ticketsToFilter = activeTab === "open" ? openTickets : archivedTickets;
    const lowerSearchQuery = searchQuery.toLowerCase();

    let filtered = ticketsToFilter.filter((ticket: TicketWithMessages) => {
      const customer = getCustomerFromTicket(ticket);
      return (
        ticket.title.toLowerCase().includes(lowerSearchQuery) ||
        customer.name.toLowerCase().includes(lowerSearchQuery) ||
        customer.email.toLowerCase().includes(lowerSearchQuery)
      );
    });

    // Apply sorting
    if (sortBy === "name") {
      filtered = [...filtered].sort((a, b) => {
        const customerA = getCustomerFromTicket(a);
        const customerB = getCustomerFromTicket(b);
        return customerA.name.localeCompare(customerB.name);
      });
    } else if (sortBy === "priority") {
      const priorityOrder: Record<TicketPriority, number> = { high: 3, medium: 2, low: 1 };
      filtered = [...filtered].sort((a, b) => {
        const priorityA = a.priority as TicketPriority;
        const priorityB = b.priority as TicketPriority;
        return priorityOrder[priorityB] - priorityOrder[priorityA];
      });
    } else if (sortBy === "lastSent") {
      filtered = [...filtered].sort((a, b) => {
        const getTicketTime = (ticket: TicketWithMessages): number => {
          if (ticket.messages && ticket.messages.length > 0) {
            return new Date(ticket.messages[ticket.messages.length - 1].createdAt).getTime();
          }
          return new Date(ticket.updatedAt || ticket.createdAt).getTime();
        };
        return getTicketTime(b) - getTicketTime(a); // Most recent first
      });
    }
    // "default" keeps original order

    return filtered;
  }, [activeTab, openTickets, archivedTickets, searchQuery, sortBy]);

  return (
    <div className="h-full flex flex-col w-full">
      {/* Header */}
      <div className="p-6 pb-4 border-b border-border">
        <div className="mb-4">
          <h2 className="mb-1.5 text-lg font-semibold tracking-tight">Support Tickets</h2>
          <h4 className="text-xs text-muted-foreground">Manage your support tickets and conversations</h4>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-10 text-sm bg-background/50 border-border/50 focus:bg-background transition-colors"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-full h-10 text-sm bg-background/50 border-border/50">
              {sortBy === "default" && <ArrowUpDown className="h-4 w-4 mr-2" />}
              {sortBy === "name" && <User className="h-4 w-4 mr-2" />}
              {sortBy === "priority" && <Signal className="h-4 w-4 mr-2" />}
              {sortBy === "lastSent" && <MessageSquare className="h-4 w-4 mr-2" />}
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  <span className="text-sm">Default</span>
                </div>
              </SelectItem>
              <SelectItem value="name">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm">Name</span>
                </div>
              </SelectItem>
              <SelectItem value="priority">
                <div className="flex items-center gap-2">
                  <Signal className="h-4 w-4" />
                  <span className="text-sm">Priority</span>
                </div>
              </SelectItem>
              <SelectItem value="lastSent">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm">Last Sent</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border bg-background/30">
        <button
          onClick={() => onTabChange("open")}
          className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-all relative ${
            activeTab === "open"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-background/50"
          }`}
        >
          <span className="relative z-10">Open</span>
          <span
            className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
              activeTab === "open" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            }`}
          >
            {openTickets.length}
          </span>
        </button>
        <button
          onClick={() => onTabChange("archived")}
          className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-all relative ${
            activeTab === "archived"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-background/50"
          }`}
        >
          <span className="relative z-10 flex items-center justify-center gap-1.5">
            <Archive className="h-3.5 w-3.5" />
            Archived
          </span>
          <span
            className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
              activeTab === "archived" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            }`}
          >
            {archivedTickets.length}
          </span>
        </button>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1 h-0">
        <div className="p-4 space-y-2 flex flex-col">
          {filteredTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <MessageSquare className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No tickets found</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                {searchQuery ? "Try adjusting your search" : "No tickets in this category"}
              </p>
            </div>
          ) : (
            filteredTickets.map((ticket: TicketWithMessages) => {
              const customer = getCustomerFromTicket(ticket);
              const unreadCount = getUnreadCount(ticket);
              const lastMessageTime = getLastMessageTime(ticket);
              const isSelected = activeTicket?.id === ticket.id;
              const isResolved = ticket.status === "closed";

              return (
                <Card
                  key={ticket.id}
                  className={`cursor-pointer transition-all duration-200 m-0 p-0 rounded-lg border overflow-hidden ${
                    isSelected
                      ? "bg-primary/10 border-primary shadow-sm shadow-primary/5"
                      : "bg-card/50 border-border/50 hover:bg-card hover:border-border hover:shadow-sm"
                  }`}
                  onClick={() => handleSelectTicket(ticket.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                            {customer.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold truncate">{ticket.title}</span>
                            {unreadCount > 0 && (
                              <Badge
                                variant="destructive"
                                className="text-[10px] px-1.5 py-0.5 h-5 font-semibold shrink-0"
                              >
                                {unreadCount}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="text-xs text-muted-foreground truncate">{customer.name}</span>
                            <span className="text-muted-foreground/50">•</span>
                            <span className="text-[11px] text-muted-foreground/70 truncate">
                              {customer.email}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          {lastMessageTime}
                        </span>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] font-medium px-2 py-0.5 h-5 ${getPriorityColor(
                            ticket.priority
                          )}`}
                        >
                          {getPriorityLabel(ticket.priority)}
                        </Badge>
                      </div>
                      {isResolved && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge
                            variant="outline"
                            className="text-[10px] px-2 py-0.5 h-5 bg-green-500/10 text-green-700 border-green-500/20"
                          >
                            <Archive className="h-2.5 w-2.5 mr-1" />
                            Resolved
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
