"use client";

import React from "react";
import { MessageSquare } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No conversation selected</h3>
        <p className="text-muted-foreground">Choose a conversation from the sidebar to view messages</p>
      </div>
    </div>
  );
}
