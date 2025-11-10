import type { CollectionConfig } from "payload";

const Messages: CollectionConfig = {
  slug: "messages",
  fields: [
    { name: "content", type: "text" },
    { name: "sentBy", type: "relationship", relationTo: "appUsers", hasMany: false, required: true },
    { name: "sentTo", type: "relationship", relationTo: "appUsers", hasMany: false, required: true },
    { name: "ticket", type: "relationship", relationTo: "tickets", hasMany: false, required: true },
    { name: "attachments", type: "relationship", relationTo: "media", hasMany: true, required: false, defaultValue: [] },
    { name: "seen", type: "checkbox", defaultValue: false, required: true },
  ],
};

export default Messages;

