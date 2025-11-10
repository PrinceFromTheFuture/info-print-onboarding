"use client";

import React from "react";
import { MessageSquare } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center bg-background">
      <div className="text-center px-6 max-w-md">
        <div className="bg-muted/50 rounded-2xl p-6 w-fit mx-auto mb-5">
          <MessageSquare className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-foreground">No conversation selected</h3>
        <p className="text-sm text-muted-foreground">
          Choose a conversation from the sidebar to start viewing and responding to messages
        </p>
      </div>
    </div>
  );
}
