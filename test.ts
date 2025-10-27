interface Message {
  id: string;
  content: string;
  sentBy: string;
  attachments?: Media[];
  read: boolean;
  conversationId: string;
  createdAt: string;
  updatedAt: string;
}

interface Ticket {
  id: string;
  title: string;
  archived: boolean;
  description: string;
  createdAt: string;
  user: string;
  updatedAt: string;
  status: "resolved" | "open";
  messages: Message[];
}

interface Media {
  id: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}
