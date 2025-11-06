"use client";

import React, { useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Image as ImageIcon, FileText, Download } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { useTRPC } from "@/trpc/trpc";
import { activeTicketSelector, addMessageToTicketAction } from "@/lib/redux/ticketsSlice/ticketsSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { useQuery } from "@tanstack/react-query";
import { useSubscription } from "@trpc/tanstack-react-query";
import { useSession } from "@/lib/auth/auth-client";
import { AppUser } from "../../../../../../../../back/payload-types";
import { formatDistanceToNow } from "date-fns";

interface Attachment {
  id: string;
  type: string;
  url: string;
  name: string;
}

export function MessageList() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data } = useSession();
  const selectedTicket = useAppSelector(activeTicketSelector);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedTicket]);
  if (!selectedTicket) return <>messages are not show in because there is an error</>;

  return (
    <div className="flex-1 p-4 py-0 flex flex-col min-h-0 overflow-hidden">
      <ScrollArea className="h-full">
        <div className="space-y-3.5 pr-4 pt-5">
          {selectedTicket.messages.map((message) => {
            const isOwnMessage = (message.sentBy as AppUser).id === data?.user.id;
            return (
              <div key={message.id} className={`flex gap-2.5 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                {!isOwnMessage && (
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs">{getInitials((message.sentBy as AppUser).name)}</AvatarFallback>
                  </Avatar>
                )}

                <div className={`max-w-[70%] ${isOwnMessage ? "order-first" : ""}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium">{(message.sentBy as AppUser).name}</span>
                    <span className="text-[11px] text-muted-foreground">{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</span>
                  </div>

                  <div className={`rounded-lg p-3 ${isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    <p className="text-xs leading-relaxed">{message.content}</p>

                    {/* Attachments */}
                    {message.attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className={cn(
                              "flex items-center gap-2.5 p-2.5 rounded-lg border transition-colors",
                              isOwnMessage
                                ? "bg-primary-foreground/10 border-primary-foreground/20 hover:bg-primary-foreground/15"
                                : "bg-background/50 border-border hover:bg-background/70"
                            )}
                          >
                            <div
                              className={cn(
                                "flex items-center justify-center h-9 w-9 rounded-md",
                                isOwnMessage ? "bg-primary-foreground/10" : "bg-muted"
                              )}
                            >
                              {attachment.type === "image" ? (
                                <ImageIcon className={cn("h-4 w-4", isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground")} />
                              ) : (
                                <FileText className={cn("h-4 w-4", isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground")} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={cn("text-xs font-medium truncate", isOwnMessage ? "text-primary-foreground" : "text-foreground")}>
                                {attachment.name}
                              </p>
                              <p className={cn("text-[11px] mt-0.5", isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground")}>
                                {attachment.type === "image" ? "Image" : "File"}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "h-8 px-2.5 text-xs shrink-0",
                                isOwnMessage
                                  ? "text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground"
                                  : "hover:bg-muted"
                              )}
                            >
                              <Download className="h-3 w-3 mr-1.5" />
                              View
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {isOwnMessage && (
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {getInitials((message.sentBy as AppUser).name)}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} className="h-24" />
        </div>
      </ScrollArea>
    </div>
  );
}
