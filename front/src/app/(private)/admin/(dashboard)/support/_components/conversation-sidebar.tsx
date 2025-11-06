"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Archive, Clock, Search, ArrowUpDown, User, Signal, MessageSquare } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { activeTicketSelector, allTicketsSelector, onSelectTicketAction } from "@/lib/redux/ticketsSlice/ticketsSlice";
import { AppUser } from "../../../../../../../../back/payload-types";
import { Conversation } from "./types";
import type { inferProcedureOutput } from "@trpc/server";
import { AppRouter } from "../../../../../../../../back/dist/src/trpc";
import { useTRPC } from "@/trpc/trpc";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "@/lib/auth/auth-client";

type TicketWithMessages = inferProcedureOutput<AppRouter["ticketsRouter"]["getAllTickets"]>[number];

interface ConversationSidebarProps {
  conversations: Conversation[];
  onSelectConversation: (conversation: Conversation) => void;
  activeTab: "open" | "archived";
  onTabChange: (tab: "open" | "archived") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

type SortOption = "default" | "name" | "priority" | "lastSent";

// Helper function to format time ago
function formatTimeAgo(dateString: string): string {
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
}

// Helper function to get customer info from ticket
function getCustomerFromTicket(ticket: TicketWithMessages): { name: string; email: string; avatar: string } {
  const createdBy = ticket.createdBy as AppUser;
  if (typeof createdBy === "string") {
    return { name: "Unknown", email: "", avatar: "" };
  }
  return {
    name: createdBy.name || "Unknown",
    email: createdBy.email || "",
    avatar: "",
  };
}

// Helper function to get last message time
function getLastMessageTime(ticket: TicketWithMessages): string {
  if (!ticket.messages || ticket.messages.length === 0) {
    return formatTimeAgo(ticket.updatedAt || ticket.createdAt);
  }
  const lastMessage = ticket.messages[ticket.messages.length - 1];
  return formatTimeAgo(lastMessage.createdAt);
}

export function ConversationSidebar({ activeTab, onTabChange, searchQuery, onSearchChange }: ConversationSidebarProps) {
  const allTickets = useAppSelector(allTicketsSelector);
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const openTickets = allTickets.filter((ticket) => ticket.status === "open");
  const archivedTickets = allTickets.filter((ticket) => ticket.status === "closed");
  const activeTicket = useAppSelector(activeTicketSelector);
  const trpc = useTRPC();
  const { mutate: notifySeenMessages } = useMutation(trpc.ticketsRouter.notifySeenMessages.mutationOptions());
  // Helper function to get unread count from ticket messages
  const { data: session } = useSession();

  function getUnreadCount(ticket: TicketWithMessages): number {
    return ticket.messages.filter((msg) => !msg.seen && (msg.sentTo as AppUser).id === session?.user.id).length;
  }
  const dispatch = useAppDispatch();
  const filteredTickets = useMemo(() => {
    let filtered = (activeTab === "open" ? openTickets : archivedTickets).filter((ticket) => {
      const createdBy = ticket.createdBy as AppUser;
      const customerName = typeof createdBy === "object" ? createdBy.name || "" : "";
      const customerEmail = typeof createdBy === "object" ? createdBy.email || "" : "";

      return (
        ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customerEmail.toLowerCase().includes(searchQuery.toLowerCase())
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
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      filtered = [...filtered].sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    } else if (sortBy === "lastSent") {
      filtered = [...filtered].sort((a, b) => {
        const timeA =
          a.messages && a.messages.length > 0
            ? new Date(a.messages[a.messages.length - 1].createdAt).getTime()
            : new Date(a.updatedAt || a.createdAt).getTime();
        const timeB =
          b.messages && b.messages.length > 0
            ? new Date(b.messages[b.messages.length - 1].createdAt).getTime()
            : new Date(b.updatedAt || b.createdAt).getTime();
        return timeB - timeA; // Most recent first
      });
    }
    // "default" keeps original order

    return filtered;
  }, [activeTab, openTickets, archivedTickets, searchQuery, sortBy]);

  const getPriorityColor = (priority: "low" | "medium" | "high") => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-600";
      case "medium":
        return "bg-yellow-500/10 text-yellow-600";
      case "low":
        return "bg-green-500/10 text-green-600";
      default:
        return "bg-gray-500/10 text-gray-600";
    }
  };

  const getPriorityLabel = (priority: "low" | "medium" | "high") => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };
  const onSelectTicket = (ticketId: string) => {
    dispatch(onSelectTicketAction({ ticketId }));
    notifySeenMessages({ ticketId });
  };

  return (
    <div className="h-full flex flex-col bg-sidebar rounded-xl w-full">
      {/* Header */}
      <div className="p-5 pt-6">
        <div className=" mb-3.5">
          <h2 className="mb-1 text-base font-semibold">Support Tickets</h2>
          <h4 className="text-xs text-muted-foreground">Manage your support tickets and conversations</h4>
        </div>

        {/* Search */}
        <div className="relative mb-2.5">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-full h-9 text-sm">
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
      <div className="flex border-b">
        <button
          onClick={() => onTabChange("open")}
          className={`flex-1 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === "open" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Open ({openTickets.length})
        </button>
        <button
          onClick={() => onTabChange("archived")}
          className={`flex-1 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === "archived" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Archive className="h-4 w-4 inline mr-1.5" />
          Archived ({archivedTickets.length})
        </button>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1 h-0">
        <div className=" p-3.5 space-y-2.5 gap-2 flex flex-col">
          {filteredTickets.map((ticket) => {
            const customer = getCustomerFromTicket(ticket);
            const unreadCount = getUnreadCount(ticket);
            const lastMessageTime = getLastMessageTime(ticket);
            const isSelected = activeTicket?.id === ticket.id;
            const isResolved = ticket.status === "closed" || ticket.resolved;

            return (
              <Card
                key={ticket.id}
                className={`cursor-pointer bg-transparent transition-colors hover:bg-primary/5 m-0 p-3 rounded-sm ${
                  isSelected ? "bg-primary/5 border-primary" : ""
                }`}
                onClick={() => {
                  onSelectTicket(ticket.id);
                }}
              >
                <CardContent className="p-0 m-0 py-0  ">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <span className="text-xs font-medium truncate text-wrap">{ticket.title}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs px-1.5 py-0">
                          {unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                          {customer.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">{customer.name}</span>
                      <span className="text-[11px] text-muted-foreground/70">{customer.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3 " />
                        {lastMessageTime}
                      </span>
                      <Badge variant="secondary" className={`text-xs font-normal px-1.5 py-0 ${getPriorityColor(ticket.priority)}`}>
                        {getPriorityLabel(ticket.priority)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      {isResolved && <span className="text-xs text-green-600 font-medium">Resolved</span>}
                      {ticket.resolved && <Archive className="h-3 w-3 text-muted-foreground" />}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
