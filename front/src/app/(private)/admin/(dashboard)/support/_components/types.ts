export interface Customer {
  name: string;
  email: string;
  avatar: string;
}

export interface Attachment {
  id: string;
  type: string;
  url: string;
  name: string;
}

export interface Message {
  id: string;
  content: string;
  sentBy: string;
  isAgent: boolean;
  timestamp: string;
  attachments: Attachment[];
}

export interface Conversation {
  id: string;
  title: string;
  customer: Customer;
  status: "open" | "resolved";
  isArchived: boolean;
  priority: "low" | "medium" | "high";
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}
