import type { CollectionConfig } from "payload";

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


interface Media {
  id: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}
const Conversations: CollectionConfig = {
  slug: "conversations",
  fields: [
    { name: "title", type: "text" },
    { name: "createBy", type: "relationship", relationTo: "appUsers", hasMany: false },
    {name:'isArchived', type: 'checkbox', defaultValue: false },
    { name: "description", type: "text" },
    { name: "status", type: "select", options: ["resolved", "open"] },
    { name: "messages", type: "relationship", relationTo: "messages", hasMany: true },
  ],
};
export default Conversations;