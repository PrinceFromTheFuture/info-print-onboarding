"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { MessageCirclePlus } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { ConversationSidebar } from "./_components/conversation-sidebar";
import ConversationChat from "./_components/conversation-chat";
import { CustomerDetailsSidebar } from "./_components/customer-details-sidebar";
import { useParams } from "next/navigation";
import { useAppDispatch } from "@/lib/redux/hooks";
import { onSelectTicketAction } from "@/lib/redux/ticketsSlice/ticketsSlice";
import { useSession } from "@/lib/auth/auth-client";
import { useTRPC } from "@/trpc/trpc";
import { useMutation } from "@tanstack/react-query";

function SupportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [activeTab, setActiveTab] = useState<"open" | "archived">("open");
  const [searchQuery, setSearchQuery] = useState("");
  const params = useParams() as { ticketId?: string };
  const dispatch = useAppDispatch();
  const { data: session } = useSession();

  const trpc = useTRPC();
  const { mutate: notifySeenMessages } = useMutation(trpc.ticketsRouter.notifySeenMessages.mutationOptions());

  // Handle ticket selection
  const handleSelectTicket = useCallback(
    (ticketId: string) => {
      dispatch(onSelectTicketAction({ ticketId, userId: session?.user?.id }));
      notifySeenMessages({ ticketId } as any);
    },
    [dispatch, notifySeenMessages, session?.user?.id, params.ticketId]
  );

  useEffect(() => {
    if (!params.ticketId) return;
    handleSelectTicket(params.ticketId);
  }, [handleSelectTicket]);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-0 left-0 right-0 bottom-0 max-w-full max-h-full m-0 p-0 min-w-full min-h-full translate-x-[-0%] translate-y-[-0%] rounded-none border-0">
        <div className="flex flex-row h-screen bg-background">
          {/* Left Sidebar - Conversations */}
          <div className="shrink-0 w-[340px] border-r border-border bg-sidebar/50">
            <ConversationSidebar activeTab={activeTab} onTabChange={setActiveTab} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
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
  );
}

export default SupportDialog;
