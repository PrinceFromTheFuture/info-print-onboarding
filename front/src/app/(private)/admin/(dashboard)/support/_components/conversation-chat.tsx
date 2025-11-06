import React from "react";
import { EmptyState } from "./empty-state";
import { ConversationHeader } from "./conversation-header";
import { Conversation } from "./types";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";

function ConversationChat({
  handleCloseTicket,
  handleArchiveTicket,
  handlePriorityChange,
  handleSendMessage,
  selectedConversation,
}: {
  handleCloseTicket: () => void;
  handleArchiveTicket: () => void;
  handlePriorityChange: (priority: "low" | "medium" | "high") => void;
  handleSendMessage: (message: string) => void;
  selectedConversation: Conversation;
}) {
  return (
    <div className="flex-1 flex flex-col min-w-0">
      {true ? (
        <div className="flex flex-col h-full justify-between">
          <div className="flex-1 relative flex flex-col overflow-hidden min-h-0 ">
            <ConversationHeader />
            <MessageList />
            <MessageInput onSendMessage={handleSendMessage} onAttachFile={() => {}} />
          </div>
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

export default ConversationChat;
