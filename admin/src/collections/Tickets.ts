import type { CollectionConfig } from "payload";

const Tickets: CollectionConfig = {
  slug: "tickets",
  fields: [
    { name: "title", type: "text", required: true },
    { name: "description", type: "text" },
    { name: "status", type: "select", options: ["open", "closed"], required: true, defaultValue: "open" },
    { name: "createdBy", type: "relationship", relationTo: "appUsers", hasMany: false, required: true },
    { name: "priority", type: "select", options: ["low", "medium", "high"], defaultValue: "low", required: true },
  ],
};
export default Tickets;

