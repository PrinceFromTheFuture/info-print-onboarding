export interface Message {
  id: string;
  content: string;
  author: string;
  timestamp: string;
  isCustomer: boolean;
}

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: "open" | "resolved" | "closed";
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}
