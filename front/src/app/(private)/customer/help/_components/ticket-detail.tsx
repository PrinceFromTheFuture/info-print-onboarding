"use client";

import { CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calendar,
  Send,
  Paperclip,
  X,
  Image as ImageIcon,
  FileText,
  Ticket as TicketIcon,
  CircleDot,
  CheckCircle2,
  Clock,
  User,
  Hash,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import type { Ticket, Message } from "@/app/(private)/customer/help/types";
import { useSession } from "@/lib/auth/auth-client";
import { ROUTES } from "@/lib/routes";
import { useEffect, useRef, useState } from "react";
import { useTRPC } from "@/trpc/trpc";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSubscription } from "@trpc/tanstack-react-query";

interface TicketDetailProps {
  ticket: Ticket;
  onClose: () => void;
  isMobile?: boolean;
}

export function TicketDetail({ ticket, isMobile = false }: TicketDetailProps) {
  const { data: session } = useSession();
  const trpc = useTRPC();
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>(ticket.messages as Message[]);

  const { data: liveMessages } = useSubscription(
    trpc.ticketsRouter.listenToTicketMessages.subscriptionOptions({ ticketId: ticket.id })
  );
  const [newMessage, setNewMessage] = useState("");

  const { mutateAsync: sendMessage } = useMutation({
    ...trpc.ticketsRouter.sendTicketMessage.mutationOptions(),

    onError: (error) => {
      toast.error(error.message);
    },
  });
  const currentUserId = session?.user?.id;
  const statusConfig = getStatusConfig(ticket.status);
  const createdAtFormatted = formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true });

  useEffect(() => {
    if (liveMessages) {
      setMessages((prevMessages) => [...prevMessages, liveMessages as Message]);
    }
  }, [liveMessages]);

  const onSendMessage = async () => {
    await sendMessage({ ticketId: ticket.id, content: newMessage });
    setNewMessage("");
  };

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div
      className={cn(
        "flex flex-col h-full pt-0 gap-2 p-0 rounded-lg border bg-sidebar text-card-foreground",
        isMobile ? "rounded-none border-0" : "border-0 rounded-none"
      )}
    >
      {!isMobile && (
        <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="p-3 md:p-4 flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                  <TicketIcon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base font-semibold line-clamp-2 mb-1">{ticket.title}</CardTitle>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge
                      variant="secondary"
                      className={cn("text-xs flex items-center gap-1 h-5 px-1.5", statusConfig.className)}
                    >
                      {ticket.status === "open" ? (
                        <CircleDot className="h-2 w-2 fill-current" />
                      ) : (
                        <CheckCircle2 className="h-2 w-2" />
                      )}
                      {statusConfig.label}
                    </Badge>
                    <Badge variant="outline" className="text-xs font-mono flex items-center gap-1 h-5 px-1.5">
                      <Hash className="h-2 w-2" />
                      {ticket.id.slice(0, 8)}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-2.5 w-2.5" />
                      <span>Created {createdAtFormatted}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isMobile && (
        <div className="p-3 border-b bg-background/95">
          <div className="flex items-start gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
              <TicketIcon className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold mb-1.5 line-clamp-2">{ticket.title}</h2>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge
                  variant="secondary"
                  className={cn("text-xs flex items-center gap-1 h-5 px-1.5", statusConfig.className)}
                >
                  {ticket.status === "open" ? (
                    <CircleDot className="h-2 w-2 fill-current" />
                  ) : (
                    <CheckCircle2 className="h-2 w-2" />
                  )}
                  {statusConfig.label}
                </Badge>
                <Badge variant="outline" className="text-xs font-mono flex items-center gap-1 h-5 px-1.5">
                  <Hash className="h-2 w-2" />
                  {ticket.id.slice(0, 8)}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-2.5 w-2.5" />
                  <span>Created {createdAtFormatted}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col p-0 overflow-hidden relative min-h-0">
        <div className="flex-1 min-h-0 h-0 overflow-hidden pb-14">
          <ScrollArea className="h-full">
            <div className="p-3 lg:p-4 pb-20 space-y-3">
              {ticket.messages.length === 0 && ticket.description && (
                <div className="flex gap-2 items-start">
                  <Avatar className="h-6 w-6 shrink-0 bg-muted">
                    <AvatarFallback className="text-xs">
                      {getInitials(session?.user?.name || "System")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className={cn("flex items-center gap-1.5 mb-1", "flex-row")}>
                      <span className="text-xs font-medium">{session?.user?.name || "System"}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="rounded-lg p-2 max-w-[85%] lg:max-w-[70%] bg-muted">
                      <p className="text-xs whitespace-pre-wrap">{ticket.description}</p>
                    </div>
                  </div>
                </div>
              )}
              {messages.map((message) => {
                const messageSender = message.sentBy;
                const isOwnMessage = messageSender.id === currentUserId;

                return (
                  <div
                    key={message.id}
                    className={cn("flex gap-2 items-start", isOwnMessage ? "flex-row-reverse" : "flex-row")}
                  >
                    <Avatar
                      className={cn("h-6 w-6 shrink-0", isOwnMessage && "bg-primary text-primary-foreground")}
                    >
                      <AvatarFallback className="text-xs">{getInitials(messageSender.name)}</AvatarFallback>
                    </Avatar>
                    <div className={cn("flex-1 min-w-0", isOwnMessage && "flex flex-col items-end")}>
                      <div
                        className={cn("flex items-center gap-1.5 mb-1", isOwnMessage && "flex-row-reverse")}
                      >
                        <span className="text-xs font-medium">{messageSender.name}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <div
                        className={cn(
                          "rounded-lg p-2 max-w-[85%] lg:max-w-[70%]",
                          isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted"
                        )}
                      >
                        <p className="text-xs whitespace-pre-wrap">{message.content || ""}</p>
                        {/* Attachments */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {message.attachments.map((attachment) => (
                              <button
                                key={attachment.id}
                                onClick={() => {
                                  if (attachment.url) {
                                    window.open(ROUTES.api.baseUrl + attachment.url, "_blank");
                                  }
                                }}
                                className={cn(
                                  "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs cursor-pointer",
                                  isOwnMessage
                                    ? "bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30"
                                    : "bg-muted/60 text-foreground hover:bg-muted/80"
                                )}
                              >
                                {attachment.mimeType?.startsWith("image/") ? (
                                  <ImageIcon className="h-2.5 w-2.5 shrink-0" />
                                ) : (
                                  <FileText className="h-2.5 w-2.5 shrink-0" />
                                )}
                                <span className="truncate max-w-[100px]">
                                  {attachment.filename || "Attachment"}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={lastMessageRef} />
            </div>
          </ScrollArea>
        </div>
        <div className="flex-shrink-0 absolute bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="p-3 lg:p-4">
            <div className="flex items-center gap-2 max-w-4xl mx-auto">
              <Button
                size="icon"
                variant="outline"
                disabled={ticket.status === "closed"}
                className="shrink-0 h-8 w-8"
                title="Attach file"
              >
                <Paperclip className="h-3.5 w-3.5" />
              </Button>
              <Input
                placeholder={
                  ticket.status === "closed"
                    ? "This ticket is closed. You cannot send messages."
                    : "Type your message..."
                }
                value={newMessage}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && newMessage.trim() && ticket.status !== "closed") {
                    e.preventDefault();
                    onSendMessage();
                  }
                }}
                disabled={ticket.status === "closed"}
                className="flex-1 text-sm h-8"
              />
              <Button
                size="icon"
                onClick={onSendMessage}
                disabled={!newMessage.trim() || ticket.status === "closed"}
                className="shrink-0 h-8 w-8"
                title="Send message"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
            {ticket.status === "closed" && (
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground max-w-4xl mx-auto">
                <CheckCircle2 className="h-3 w-3" />
                <span>This ticket has been closed</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getStatusConfig(status: "open" | "closed") {
  const configs = {
    open: {
      label: "Open",
      className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    },
    closed: {
      label: "Closed",
      className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    },
  };
  return configs[status];
}
