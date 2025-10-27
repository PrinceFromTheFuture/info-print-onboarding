"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Archive, Clock, Search, Plus } from "lucide-react";

interface Customer {
  name: string;
  email: string;
  avatar: string;
}

interface Message {
  id: string;
  content: string;
  sentBy: string;
  isAgent: boolean;
  timestamp: string;
  attachments: Array<{
    id: string;
    type: string;
    url: string;
    name: string;
  }>;
}

interface Conversation {
  id: string;
  title: string;
  customer: Customer;
  status: "open" | "resolved";
  isArchived: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

interface ConversationSidebarProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  activeTab: "open" | "archived";
  onTabChange: (tab: "open" | "archived") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ConversationSidebar({
  conversations,
  selectedConversation,
  onSelectConversation,
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
}: ConversationSidebarProps) {
  const openConversations = conversations.filter((conv) => !conv.isArchived && conv.status === "open");
  const archivedConversations = conversations.filter((conv) => conv.isArchived || conv.status === "resolved");

  const filteredConversations = (activeTab === "open" ? openConversations : archivedConversations).filter(
    (conv) =>
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full border-r bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className=" mb-4">
          <h2 className="mb-1 text-lg font-semibold">Support Tickets</h2>
          <h4 className="text-sm text-muted-foreground">Manage your support tickets and conversations</h4>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search conversations..." value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} className="pl-10" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => onTabChange("open")}
          className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "open" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Open ({openConversations.length})
        </button>
        <button
          onClick={() => onTabChange("archived")}
          className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "archived" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Archive className="h-4 w-4 inline mr-2" />
          Archived ({archivedConversations.length})
        </button>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1 ">
        <div className="px-2 p-4 space-y-4 gap-2 flex flex-col">
          {filteredConversations.map((conversation) => (
            <Card
              key={conversation.id}
              className={`cursor-pointer bg-transparent transition-colors hover:bg-accent m-0 p-4 rounded-sm ${
                selectedConversation?.id === conversation.id ? "bg-accent border-primary" : ""
              }`}
              onClick={() => onSelectConversation(conversation)}
            >
              <CardContent className="p-0 m-0 py-0  ">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate text-wrap">{conversation.title}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {conversation.unreadCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {conversation.customer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">{conversation.customer.name}</span>
                    <span className="text-xs text-muted-foreground/70">{conversation.customer.email}</span>
                  </div>
                </div>

                <p className="text-xs text-wrap text-muted-foreground truncate mb-2">{conversation.lastMessage.slice(0, 85)}...</p>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3 " />
                    {conversation.lastMessageTime}
                  </span>
                  <div className="flex items-center gap-1">
                    {conversation.status === "resolved" && <span className="text-xs text-green-600 font-medium">Resolved</span>}
                    {conversation.isArchived && <Archive className="h-3 w-3 text-muted-foreground" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
