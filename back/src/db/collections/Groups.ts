import type { CollectionConfig } from "payload";

const Groups: CollectionConfig = {
  slug: "groups",
  fields: [
    {
      name: "title",
      type: "text",
      required: false,
    },
    { name: "order", type: "number" },
    {
      name: "showIf",
      type: "group",
      fields: [
        { name: "question", type: "relationship", relationTo: "questions", hasMany: false },
        { name: "equalTo", type: "text" },
      ],
    },
    {
      name: "questions",
      type: "relationship",
      relationTo: "questions",
      hasMany: true,
    },
  ],
};

export default Groups;
