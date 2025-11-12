"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCirclePlus } from "lucide-react";
import { useSubscription } from "@trpc/tanstack-react-query";
import { useTRPC } from "@/trpc/trpc";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { activeTicketSelector, addMessageToTicketAction, getAllTicketsAsyncThunk } from "@/lib/redux/ticketsSlice/ticketsSlice";
import { ConversationSidebar } from "./_components/conversation-sidebar";
import { CustomerDetailsSidebar } from "./_components/customer-details-sidebar";
import ConversationChat from "./_components/conversation-chat";
import { Message } from "../../../../../../../back/payload-types";
import { useSession } from "@/lib/auth/auth-client";
import SupportDialog from "./SupportDialog";
import { useParams } from "next/navigation";

export default function SupportPage() {
  const trpc = useTRPC();
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const params = useParams();
  // Subscribe to live messages
  const { data: liveMessage } = useSubscription(trpc.ticketsRouter.listenToAllTicketMessages.subscriptionOptions());

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

  useEffect(() => {
    setOpen(true);
  }, [params.ticketId]);

  const [open, setOpen] = useState(true);

  return (
    <div className="h-full">
      <div className="flex flex-col gap-3 p-6 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Support Center</h1>
            <p className="text-sm text-muted-foreground mt-1.5">Manage customer conversations and support tickets</p>
            <Button className="mt-4" onClick={() => setOpen(true)}>
              Open Support Dialog
            </Button>
          </div>
        </div>
        <SupportDialog open={open} onOpenChange={setOpen} />
      </div>
    </div>
  );
}
