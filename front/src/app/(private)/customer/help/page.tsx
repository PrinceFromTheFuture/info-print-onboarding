"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, Plus, X } from "lucide-react";
import { TicketList, TicketDetail, EmptyState } from "./_components";
import type { Ticket } from "./types";
import { useIsMobile } from "@/hooks/use-mobile";
import { AnimatePresence, motion } from "framer-motion";
// Fake data
const fakeTickets: Ticket[] = [
  {
    id: "1",
    subject: "Need help with login issues",
    description: "I'm having trouble logging into my account. It keeps showing an error message.",
    status: "open",
    createdAt: "2024-01-15 10:30 AM",
    updatedAt: "2 hours ago",
    messages: [
      {
        id: "1",
        content: "I'm having trouble logging into my account. It keeps showing an error message.",
        author: "You",
        timestamp: "2024-01-15 10:30 AM",
        isCustomer: true,
      },
      {
        id: "2",
        content:
          "Thank you for contacting us. We're looking into your login issue. Can you please provide more details about the error message you're seeing?",
        author: "Support Team",
        timestamp: "2024-01-15 11:15 AM",
        isCustomer: false,
      },
      {
        id: "3",
        content: "The error message says 'Invalid credentials' but I'm sure my password is correct.",
        author: "You",
        timestamp: "2 hours ago",
        isCustomer: true,
      },
    ],
  },
  {
    id: "2",
    subject: "How to reset my password?",
    description: "I forgot my password and need to reset it.",
    status: "resolved",
    createdAt: "2024-01-14 3:45 PM",
    updatedAt: "1 day ago",
    messages: [
      {
        id: "1",
        content: "I forgot my password and need to reset it.",
        author: "You",
        timestamp: "2024-01-14 3:45 PM",
        isCustomer: true,
      },
      {
        id: "2",
        content: "You can reset your password by clicking on 'Forgot Password' on the login page. We've sent you an email with reset instructions.",
        author: "Support Team",
        timestamp: "2024-01-14 4:00 PM",
        isCustomer: false,
      },
    ],
  },
  {
    id: "3",
    subject: "Feature request: Dark mode",
    description: "It would be great to have a dark mode option for better visibility.",
    status: "closed",
    createdAt: "2024-01-10 9:20 AM",
    updatedAt: "5 days ago",
    messages: [
      {
        id: "1",
        content: "It would be great to have a dark mode option for better visibility.",
        author: "You",
        timestamp: "2024-01-10 9:20 AM",
        isCustomer: true,
      },
      {
        id: "2",
        content: "Thank you for your suggestion! We've added this to our feature roadmap and will notify you when it's available.",
        author: "Support Team",
        timestamp: "2024-01-10 2:30 PM",
        isCustomer: false,
      },
    ],
  },
];

export default function HelpPage() {
  const [tickets, setTickets] = useState<Ticket[]>(fakeTickets);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: "", description: "" });
  const [newMessage, setNewMessage] = useState("");

  const isMobile = useIsMobile();

  const handleCreateTicket = () => {
    if (!newTicket.subject || !newTicket.description) return;

    const ticket: Ticket = {
      id: Date.now().toString(),
      ...newTicket,
      status: "open",
      createdAt: new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric" }),
      updatedAt: "Just now",
      messages: [
        {
          id: "1",
          content: newTicket.description,
          author: "You",
          timestamp: new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric" }),
          isCustomer: true,
        },
      ],
    };

    setTickets([ticket, ...tickets]);
    setSelectedTicket(ticket.id);
    setNewTicket({ subject: "", description: "" });
    setIsCreateDialogOpen(false);
  };

  const handleSendMessage = () => {
    if (!newMessage || !selectedTicket) return;

    const ticket = tickets.find((t) => t.id === selectedTicket);
    if (!ticket) return;

    const message = {
      id: Date.now().toString(),
      content: newMessage,
      author: "You",
      timestamp: "Just now",
      isCustomer: true,
    };

    const updatedTicket = {
      ...ticket,
      messages: [...ticket.messages, message],
      updatedAt: "Just now",
    };

    setTickets(tickets.map((t) => (t.id === selectedTicket ? updatedTicket : t)));
    setNewMessage("");
  };

  const selectedTicketData = tickets.find((t) => t.id === selectedTicket);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <HelpCircle className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            Help & Support
          </h1>
          <p className="text-muted-foreground mt-1">Get help with your questions and issues</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Ticket</DialogTitle>
              <DialogDescription>Describe your issue and we'll get back to you as soon as possible.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Subject</label>
                <Input
                  placeholder="Brief description of your issue"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  placeholder="Provide detailed information about your issue..."
                  rows={5}
                  value={newTicket.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewTicket({ ...newTicket, description: e.target.value })}
                />
              </div>
              <Button onClick={handleCreateTicket} className="w-full">
                Create Ticket
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tickets List */}
        <div className="lg:col-span-1">
          <TicketList tickets={tickets} selectedTicket={selectedTicket} onSelectTicket={setSelectedTicket} />
        </div>

        {/* Ticket Detail */}
        <AnimatePresence>
          {isMobile ? (
            selectedTicketData ? (
              <motion.div
                initial={{ opacity: 0, y: 100, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 100, scale: 0.9 }}
                transition={{ duration: 0.1 }}
                className="fixed inset-0 z-50 bg-background"
              >
                <div className="h-full flex flex-col">
                  {/* Mobile Header with Close Button */}
                  <div className="flex items-center justify-between p-4 border-b bg-background">
                    <h2 className="text-lg font-semibold truncate flex-1 mr-4">{selectedTicketData.subject}</h2>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedTicket(null)} className="shrink-0">
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Mobile Ticket Detail Content */}
                  <div className="flex-1 overflow-hidden">
                    <TicketDetail
                      ticket={selectedTicketData}
                      newMessage={newMessage}
                      onMessageChange={setNewMessage}
                      onSendMessage={handleSendMessage}
                      onClose={() => setSelectedTicket(null)}
                      isMobile={true}
                    />
                  </div>
                </div>
              </motion.div>
            ) : null
          ) : (
            <div className="lg:col-span-2">
              {selectedTicketData ? (
                <TicketDetail
                  ticket={selectedTicketData}
                  newMessage={newMessage}
                  onMessageChange={setNewMessage}
                  onSendMessage={handleSendMessage}
                  onClose={() => setSelectedTicket(null)}
                  isMobile={false}
                />
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
