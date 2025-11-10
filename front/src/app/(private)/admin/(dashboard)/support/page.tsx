"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCirclePlus } from "lucide-react";
import { useSubscription } from "@trpc/tanstack-react-query";
import { useTRPC } from "@/trpc/trpc";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  activeTicketSelector,
  addMessageToTicketAction,
  getAllTicketsAsyncThunk,
} from "@/lib/redux/ticketsSlice/ticketsSlice";
import { ConversationSidebar } from "./_components/conversation-sidebar";
import { CustomerDetailsSidebar } from "./_components/customer-details-sidebar";
import ConversationChat from "./_components/conversation-chat";
import { Message } from "../../../../../../../back/payload-types";
import { useSession } from "@/lib/auth/auth-client";

export default function SupportPage() {
  const trpc = useTRPC();
  const dispatch = useAppDispatch();
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState<"open" | "archived">("open");
  const [searchQuery, setSearchQuery] = useState("");

  // Subscribe to live messages
  const { data: liveMessage } = useSubscription(
    trpc.ticketsRouter.listenToAllTicketMessages.subscriptionOptions()
  );

  // Handle incoming live messages
  useEffect(() => {
    if (!liveMessage) return;

    const message = liveMessage as Message;
    dispatch(addMessageToTicketAction(message));

    // Play sound notification only if message is from another user
    const messageSender = message.sentBy as { id: string } | undefined;
    const messageSenderId = messageSender?.id;
    if (messageSenderId && messageSenderId !== session?.user?.id) {
      const audio = new Audio("/new_message.wav");
      audio.play().catch(() => {
        // Silently fail if audio cannot play
      });
    }
  }, [liveMessage, dispatch, session?.user?.id]);

  // Fetch tickets on mount
  useEffect(() => {
    dispatch(getAllTicketsAsyncThunk());
  }, [dispatch]);

  return (
    <div className="h-full">
      <div className="flex flex-col gap-3 p-6 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Support Center</h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              Manage customer conversations and support tickets
            </p>
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild className="w-min">
            <Button size="default" className="mt-2">
              <MessageCirclePlus className="h-4 w-4 mr-2" />
              Open Support Dashboard
            </Button>
          </DialogTrigger>
          <DialogContent className="top-0 left-0 right-0 bottom-0 max-w-full max-h-full m-0 p-0 min-w-full min-h-full translate-x-[-0%] translate-y-[-0%] rounded-none border-0">
            <div className="flex flex-row h-screen bg-background">
              {/* Left Sidebar - Conversations */}
              <div className="shrink-0 w-[340px] border-r border-border bg-sidebar/50">
                <ConversationSidebar
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              </div>

              {/* Middle Panel - Conversation View */}
              <div className="flex-1 flex flex-col min-w-0 bg-background">
                <ConversationChat />
              </div>

              {/* Right Sidebar - Customer Details */}
              <div className="shrink-0 w-[280px] border-l border-border bg-sidebar/50">
                <CustomerDetailsSidebar />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
