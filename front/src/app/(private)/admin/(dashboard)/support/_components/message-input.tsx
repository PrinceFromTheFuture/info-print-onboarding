"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onAttachFile: () => void;
}

export function MessageInput({ onSendMessage, onAttachFile }: MessageInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-4  bg-card">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onAttachFile}>
          <Paperclip className="h-4 w-4" />
        </Button>
        <Input
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button type="submit" disabled={!message.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
