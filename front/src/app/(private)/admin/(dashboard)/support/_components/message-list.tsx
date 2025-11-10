"use client";

import React, { useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Image as ImageIcon, FileText, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn, getInitials } from "@/lib/utils";
import { useAppSelector } from "@/lib/redux/hooks";
import { activeTicketSelector } from "@/lib/redux/ticketsSlice/ticketsSlice";
import { useSession } from "@/lib/auth/auth-client";
import { AppUser } from "../../../../../../../../back/payload-types";
import { ROUTES } from "@/lib/routes";

export function MessageList() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const selectedTicket = useAppSelector(activeTicketSelector);

  // Auto-scroll to bottom when ticket or messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedTicket?.messages]);

  if (!selectedTicket) {
    return null;
  }

  const currentUserId = session?.user?.id;

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-background">
      <ScrollArea className="h-full">
        <div className="space-y-4 pr-4 pt-6  px-6">
          {selectedTicket.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16 px-4">
              <div className="bg-muted/50 rounded-full p-4 mb-4">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">No messages yet</p>
              <p className="text-xs text-muted-foreground">
                Start the conversation by sending a message below
              </p>
            </div>
          ) : (
            selectedTicket.messages.map((message: any) => {
              const messageSender = message.sentBy as AppUser;
              const isOwnMessage = messageSender.id === currentUserId;

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 items-start ${isOwnMessage ? "justify-end" : "justify-start"} group`}
                >
                  {!isOwnMessage && (
                    <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                        {getInitials(messageSender.name)}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div className={`flex flex-col max-w-[75%] ${isOwnMessage ? "items-end" : "items-start"}`}>
                    <div
                      className={`flex items-center gap-2 mb-1.5 px-1 ${
                        isOwnMessage ? "flex-row-reverse" : ""
                      }`}
                    >
                      <span className="text-xs font-semibold text-foreground">{messageSender.name}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                      </span>
                    </div>

                    <div
                      className={`rounded-md px-2 py-1 shadow-sm ${
                        isOwnMessage
                          ? "bg-primary text-primary-foreground rounded-tr-xs"
                          : "bg-muted text-foreground rounded-tl-xs"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {message.content}
                      </p>

                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5 mb-2">
                          {message.attachments.map((attachment: any) => (
                            <button
                              key={attachment.id}
                              onClick={() => {
                                window.open(ROUTES.api.baseUrl + attachment.url, "_blank");
                              }}
                              className={cn(
                                "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs cursor-pointer",
                                isOwnMessage
                                  ? "bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30"
                                  : "bg-muted/60 text-foreground hover:bg-muted/80"
                              )}
                            >
                              {attachment.type === "image" ? (
                                <ImageIcon className="h-3 w-3 shrink-0" />
                              ) : (
                                <FileText className="h-3 w-3 shrink-0" />
                              )}
                              <span className="truncate max-w-[120px]">{attachment.filename}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {isOwnMessage && (
                    <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground font-semibold">
                        {getInitials(messageSender.name)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </ScrollArea>
    </div>
  );
}
