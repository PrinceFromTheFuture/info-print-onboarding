"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, Plus, X, Ticket as TicketIcon, FileText, AlertCircle, ArrowRight } from "lucide-react";
import { TicketList, TicketDetail, EmptyState } from "./_components";
import type { Ticket } from "./types";
import { useIsMobile } from "@/hooks/use-mobile";
import { AnimatePresence, motion } from "framer-motion";
import { useTRPC } from "@/trpc/trpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
// TODO: Replace with real data from tRPC when implementing logic
// This is placeholder data structure matching the real Payload types

export default function HelpPage() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.ticketsRouter.getUserTickets.queryOptions({}));
  const queryClient = useQueryClient();
  const { mutateAsync: createTicket } = useMutation(
    trpc.ticketsRouter.createTicket.mutationOptions({
      onSuccess: () => {
        toast.success("Ticket created successfully");
        queryClient.invalidateQueries(trpc.ticketsRouter.getUserTickets.queryOptions({}));
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );
  const tickets = (data || []) as unknown as Ticket[];
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: "", description: "" });

  const isMobile = useIsMobile();

  const handleCreateTicket = () => {
    // TODO: Implement with tRPC createTicket mutation
    // This is placeholder - will be replaced with actual API call
    if (!newTicket.subject || !newTicket.description) return;

    createTicket({ title: newTicket.subject, description: newTicket.description });
    // Note: The real API uses 'title' not 'subject', but we'll keep the form field as 'subject' for now
    // and map it to 'title' when calling the API
    setIsCreateDialogOpen(false);
  };

  const selectedTicketData = tickets.find((t) => t.id === selectedTicket);
  const openTicket = tickets.find((t) => t.status === "open");

  return (
    <div className="flex flex-1 flex-col h-screen overflow-hidden max-h-[calc(100vh-58px)] max-w-6xl mx-auto ">
      {/* Header - Fixed at top */}
      <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 md:p-4 max-w-full">
          <div>
            <h1 className="text-lg md:text-xl font-semibold tracking-tight flex items-center gap-2">
              <HelpCircle className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              Help & Support
            </h1>
            <p className="text-muted-foreground mt-0.5 text-xs">Get help with your questions and issues</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto" size="sm">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                New Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle className="text-lg">Create New Ticket</DialogTitle>
                <DialogDescription className="text-sm"></DialogDescription>
              </DialogHeader>
        
              <div className="space-y-3 pt-3">
                <div>
                  <label className="text-xs font-medium mb-1.5 block flex items-center gap-1.5">
                    <TicketIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    Subject
                  </label>
                  <Input
                    placeholder="Brief description of your issue"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    Description
                  </label>
                  <Textarea
                    placeholder="Provide detailed information about your issue..."
                    rows={4}
                    value={newTicket.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewTicket({ ...newTicket, description: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <Button onClick={handleCreateTicket} className="w-full" size="sm" disabled={!newTicket.subject || !newTicket.description}>
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Create Ticket
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content - Flex layout for desktop */}
      <div className="flex-1 flex overflow-hidden  h-full ">
        {/* Sidebar - Fixed width on desktop */}
        <div className="hidden sm:flex sm:w-80 sm:flex-shrink-0 border-r bg-sidebar/50 overflow-hidden">
          <div className="w-full h-full">
            <TicketList tickets={tickets} selectedTicket={selectedTicket} onSelectTicket={setSelectedTicket} />
          </div>
        </div>

        {/* Mobile: Full width ticket list */}
        {isMobile && !selectedTicketData && (
          <div className="flex-1 overflow-hidden lg:hidden">
            <TicketList tickets={tickets} selectedTicket={selectedTicket} onSelectTicket={setSelectedTicket} />
          </div>
        )}

        {/* Main Content Area - Flexible width */}
        <AnimatePresence mode="wait">
          {isMobile ? (
            selectedTicketData ? (
              <motion.div
                key="mobile-detail"
                initial={{ opacity: 0, x: "100%" }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: "100%" }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="fixed inset-0 z-50 bg-background lg:hidden"
              >
                <div className="h-full flex flex-col">
                  {/* Mobile Header with Close Button */}
                  <div className="flex-shrink-0 flex items-center justify-between p-3 border-b bg-background/95 backdrop-blur">
                    <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                      <TicketIcon className="h-4 w-4 text-primary shrink-0" />
                      <h2 className="text-base font-semibold truncate">{selectedTicketData.title}</h2>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedTicket(null)} className="shrink-0 h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Mobile Ticket Detail Content */}
                  <div className="flex-1 overflow-hidden">
                    <TicketDetail ticket={selectedTicketData} onClose={() => setSelectedTicket(null)} isMobile={true} />
                  </div>
                </div>
              </motion.div>
            ) : null
          ) : (
            <div key="desktop-content" className="flex-1 flex flex-col overflow-hidden bg-background">
              {selectedTicketData ? (
                <TicketDetail ticket={selectedTicketData} onClose={() => setSelectedTicket(null)} isMobile={false} />
              ) : (
                <EmptyState onCreateTicket={() => setIsCreateDialogOpen(true)} />
              )}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
