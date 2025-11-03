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
        { name: "question", type: "relationship", relationTo: "questions", hasMany: false, },
        {
          name: "condition",
          type: "select",
          options: ["equals", "not equals"],
          
        },
        { name: "value", type: "text", },
      ],
      required: false,
   
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
