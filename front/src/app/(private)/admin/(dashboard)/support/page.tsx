"use client";

import React, { useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ConversationSidebar, ConversationHeader, MessageList, MessageInput, EmptyState, type Conversation } from "./_components";

// Static sample data
const sampleConversations: Conversation[] = [
  {
    id: "1",
    title: "Login Issues with Mobile App",
    customer: { name: "John Smith", email: "john@example.com", avatar: "/avatars/01.png" },
    status: "open",
    isArchived: false,
    lastMessage:
      "I'm still having trouble logging in. The app crashes every timeble logging in. The app crashes every timeble logging in. The app crashes every timeble logging in. The app crashes every time ble logging in. The app crashes every timeble logging in. The app crashes every timeble logging in. The app crashes every time I try to authenticate.",
    lastMessageTime: "2 minutes ago",
    unreadCount: 2,
    messages: [
      {
        id: "1",
        content: "Hi, I'm having trouble logging into the mobile app. It keeps crashing when I try to sign in.",
        sentBy: "John Smith",
        isAgent: false,
        timestamp: "10:30 AM",
        attachments: [],
      },
      {
        id: "2",
        content: "Hello John! I'm sorry to hear about the login issues. Let me help you troubleshoot this. Can you tell me what device you're using?",
        sentBy: "Admin",
        isAgent: true,
        timestamp: "10:32 AM",
        attachments: [{ id: "7", type: "file", url: "/media/troubleshooting-guide.pdf", name: "troubleshooting-guide.pdf" }],
      },
      {
        id: "3",
        content: "I'm using an iPhone 13 with iOS 16.2. The app version is 2.1.4. Here's a screenshot of the error:",
        sentBy: "John Smith",
        isAgent: false,
        timestamp: "10:35 AM",
        attachments: [
          { id: "8", type: "image", url: "/media/iphone-error-screenshot.png", name: "iphone-error-screenshot.png" },
          { id: "9", type: "file", url: "/media/app-logs.txt", name: "app-logs.txt" },
        ],
      },
      {
        id: "4",
        content: "I'm still having trouble logging in. The app crashes every time I try to authenticate.",
        sentBy: "John Smith",
        isAgent: false,
        timestamp: "2 minutes ago",
        attachments: [],
      },
    ],
  },
  {
    id: "2",
    title: "Payment Processing Error",
    customer: { name: "Emily Davis", email: "emily@example.com", avatar: "/avatars/02.png" },
    status: "open",
    isArchived: false,
    lastMessage: "The payment went through but I didn't receive a confirmation email.",
    lastMessageTime: "15 minutes ago",
    unreadCount: 0,
    messages: [
      {
        id: "1",
        content: "I just made a payment but didn't receive a confirmation email. Can you check if the payment went through?",
        sentBy: "Emily Davis",
        isAgent: false,
        timestamp: "9:45 AM",
        attachments: [],
      },
      {
        id: "2",
        content: "I can see your payment was processed successfully. Let me send you a confirmation email right away.",
        sentBy: "Admin",
        isAgent: true,
        timestamp: "9:47 AM",
        attachments: [
          { id: "5", type: "file", url: "/media/payment-receipt.pdf", name: "payment-receipt.pdf" },
          { id: "6", type: "file", url: "/media/transaction-details.xlsx", name: "transaction-details.xlsx" },
        ],
      },
    ],
  },
  {
    id: "3",
    title: "Feature Request: Dark Mode",
    customer: { name: "Alex Rodriguez", email: "alex@example.com", avatar: "/avatars/03.png" },
    status: "resolved",
    isArchived: false,
    lastMessage: "Thank you! The dark mode looks great.",
    lastMessageTime: "1 hour ago",
    unreadCount: 0,
    messages: [
      {
        id: "1",
        content: "Would it be possible to add a dark mode option to the web interface?",
        sentBy: "Alex Rodriguez",
        isAgent: false,
        timestamp: "8:30 AM",
        attachments: [],
      },
      {
        id: "-1sd",
        content: "Would it be possible to add a dark mode option to the web interface?",
        sentBy: "Alex Rodriguez",
        isAgent: false,
        timestamp: "8:30 AM",
        attachments: [],
      },
      {
        id: "-1f32",
        content: "Would it be possible to add a dark mode option to the web interface?",
        sentBy: "Alex Rodriguez",
        isAgent: false,
        timestamp: "8:30 AM",
        attachments: [],
      },
      {
        id: "-1fsd",
        content: "Would it be possible to add a dark mode option to the web interface?",
        sentBy: "Alex Rodriguez",
        isAgent: false,
        timestamp: "8:30 AM",
        attachments: [],
      },
      {
        id: "-31",
        content: "Would it be possible to add a dark mode option to the web interface?",
        sentBy: "Alex Rodriguez",
        isAgent: false,
        timestamp: "8:30 AM",
        attachments: [],
      },
      {
        id: "-1fsdf",
        content: "Would it be possible to add a dark mode option to the web interface?",
        sentBy: "Alex Rodriguez",
        isAgent: false,
        timestamp: "8:30 AM",
        attachments: [],
      },
      {
        id: "fsd1",
        content: "Would it be possible to add a dark mode option to the web interface?",
        sentBy: "Alex Rodriguez",
        isAgent: false,
        timestamp: "8:30 AM",
        attachments: [],
      },
      {
        id: "1",
        content: "Would it be possible to add a dark mode option to the web interface?",
        sentBy: "Alex Rodriguez",
        isAgent: false,
        timestamp: "8:30 AM",
        attachments: [],
      },
      {
        id: "1fsd",
        content: "Would it be possible to add a dark mode option to the web interface?",
        sentBy: "Alex Rodriguez",
        isAgent: false,
        timestamp: "8:30 AM",
        attachments: [],
      },
      {
        id: "fsd1",
        content: "Would it be possible to add a dark mode option to the web interface?",
        sentBy: "Alex Rodriguez",
        isAgent: false,
        timestamp: "8:30 AM",
        attachments: [],
      },
      {
        id: "-2",
        content: "Would it be possible to add a dark mode option to the web interface?",
        sentBy: "Alex Rodriguez",
        isAgent: false,
        timestamp: "8:30 AM",
        attachments: [],
      },
      {
        id: "2",
        content:
          "Great suggestion! We've actually been working on this feature. I'll add your request to our roadmap. Here's a preview of what we're working on:",
        sentBy: "Admin",
        isAgent: true,
        timestamp: "8:35 AM",
        attachments: [
          { id: "10", type: "image", url: "/media/dark-mode-preview.png", name: "dark-mode-preview.png" },
          { id: "11", type: "file", url: "/media/feature-roadmap.pdf", name: "feature-roadmap.pdf" },
        ],
      },
      {
        id: "3",
        content: "Thank you! The dark mode looks great.",
        sentBy: "Alex Rodriguez",
        isAgent: false,
        timestamp: "1 hour ago",
        attachments: [],
      },
    ],
  },
  {
    id: "4",
    title: "Account Deactivation Request",
    customer: { name: "Lisa Wang", email: "lisa@example.com", avatar: "/avatars/04.png" },
    status: "resolved",
    isArchived: true,
    lastMessage: "Thank you for your help with the account deactivation.",
    lastMessageTime: "2 days ago",
    unreadCount: 0,
    messages: [
      {
        id: "1",
        content: "I would like to deactivate my account. Can you help me with this process?",
        sentBy: "Lisa Wang",
        isAgent: false,
        timestamp: "2 days ago",
        attachments: [],
      },
      {
        id: "2",
        content: "I'm sorry to see you go, Lisa. I've processed your account deactivation request. You'll receive a confirmation email shortly.",
        sentBy: "Admin",
        isAgent: true,
        timestamp: "2 days ago",
        attachments: [
          { id: "12", type: "file", url: "/media/account-deactivation-confirmation.pdf", name: "account-deactivation-confirmation.pdf" },
          { id: "13", type: "file", url: "/media/data-export-instructions.pdf", name: "data-export-instructions.pdf" },
        ],
      },
      {
        id: "3",
        content: "Thank you for your help with the account deactivation.",
        sentBy: "Lisa Wang",
        isAgent: false,
        timestamp: "2 days ago",
        attachments: [],
      },
    ],
  },
  {
    id: "5",
    title: "Bug Report: Data Export",
    customer: { name: "David Kim", email: "david@example.com", avatar: "/avatars/05.png" },
    status: "open",
    isArchived: false,
    lastMessage: "The exported CSV file is missing some columns. Here's a screenshot of the issue.",
    lastMessageTime: "30 minutes ago",
    unreadCount: 1,
    messages: [
      {
        id: "1",
        content: "I'm trying to export my data but the CSV file seems to be missing some columns. Can you help?",
        sentBy: "David Kim",
        isAgent: false,
        timestamp: "11:00 AM",
        attachments: [
          { id: "1", type: "image", url: "/media/screenshot-export-issue.png", name: "export-issue.png" },
          { id: "2", type: "file", url: "/media/export-data.csv", name: "export-data.csv" },
        ],
      },
      {
        id: "2",
        content: "The exported CSV file is missing some columns. Here's a screenshot of the issue.",
        sentBy: "David Kim",
        isAgent: false,
        timestamp: "30 minutes ago",
        attachments: [
          { id: "3", type: "image", url: "/media/screenshot-export-issue-2.png", name: "export-issue-2.png" },
          { id: "4", type: "image", url: "/media/error-screenshot.png", name: "error-screenshot.png" },
        ],
      },
    ],
  },
];

export default function SupportPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(sampleConversations[0]);
  const [activeTab, setActiveTab] = useState<"open" | "archived">("open");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSendMessage = (message: string) => {
    console.log("Sending message:", message);
    // TODO: Implement message sending logic
  };

  const handleAttachFile = () => {
    console.log("Attaching file");
    // TODO: Implement file attachment logic
  };

  const handleCloseTicket = () => {
    if (selectedConversation) {
      // Mark as resolved - this will automatically archive it
      const updatedConversation = {
        ...selectedConversation,
        status: selectedConversation.status === "open" ? "resolved" : ("open" as "open" | "resolved"),
      };
      setSelectedConversation(updatedConversation);

      // Update the conversation in the sample data
      const updatedConversations = sampleConversations.map((conv) => (conv.id === selectedConversation.id ? updatedConversation : conv));
      // In a real app, you would update the backend here
      console.log("Ticket status updated:", updatedConversation.status);
    }
  };

  const handleArchiveTicket = () => {
    if (selectedConversation && selectedConversation.status === "open") {
      const updatedConversation = {
        ...selectedConversation,
        isArchived: !selectedConversation.isArchived,
      };
      setSelectedConversation(updatedConversation);

      // Update the conversation in the sample data
      const updatedConversations = sampleConversations.map((conv) => (conv.id === selectedConversation.id ? updatedConversation : conv));
      console.log("Ticket archived status updated:", updatedConversation.isArchived);
    }
  };

  return (
    <div className="h-screen bg-background">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Sidebar */}
        <ResizablePanel defaultSize={15} minSize={18} maxSize={40} className="">
          <ConversationSidebar
            conversations={sampleConversations}
            selectedConversation={selectedConversation}
            onSelectConversation={setSelectedConversation}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Main Content */}
        <ResizablePanel defaultSize={75} minSize={60}>
          <div className="h-full flex flex-col max-h-[100px]">
            {selectedConversation ? (
              <>
                <ConversationHeader conversation={selectedConversation} onCloseTicket={handleCloseTicket} onArchiveTicket={handleArchiveTicket} />
                <MessageList messages={selectedConversation.messages} />
                <MessageInput onSendMessage={handleSendMessage} onAttachFile={handleAttachFile} />
              </>
            ) : (
              <EmptyState />
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
