"use client";

import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Image as ImageIcon, FileText } from "lucide-react";

interface Attachment {
  id: string;
  type: string;
  url: string;
  name: string;
}

interface Message {
  id: string;
  content: string;
  sentBy: string;
  isAgent: boolean;
  timestamp: string;
  attachments: Attachment[];
}

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <ScrollArea className="flex-1 p-4 max-h-[calc(100vh-300px)]">
      <div className="space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 ${message.isAgent ? "justify-end" : "justify-start"}`}>
            {!message.isAgent && (
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-sm">
                  {message.sentBy
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            )}

            <div className={`max-w-[70%] ${message.isAgent ? "order-first" : ""}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">{message.sentBy}</span>
                <span className="text-xs text-muted-foreground">{message.timestamp}</span>
              </div>

              <div className={`rounded-lg p-3 ${message.isAgent ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                <p className="text-sm">{message.content}</p>

                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {message.attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center gap-2 p-2 bg-background/50 rounded border">
                        {attachment.type === "image" ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                        <span className="text-xs">{attachment.name}</span>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {message.isAgent && (
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-sm bg-primary text-primary-foreground">
                  {message.sentBy
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
