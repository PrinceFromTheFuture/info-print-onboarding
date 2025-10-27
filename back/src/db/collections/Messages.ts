import type { CollectionConfig } from "payload";



  const Messages: CollectionConfig = {
    slug: "messages",
    fields: [
      { name: "content", type: "text" },
      { name: "sentBy", type: "relationship", relationTo: "appUsers", hasMany: false },
      { name: "attachments", type: "relationship", relationTo: "media", hasMany: true },
      { name: "read", type: "checkbox", defaultValue: false },
    ],
  }
  export default Messages;