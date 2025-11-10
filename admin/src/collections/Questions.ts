import type { CollectionConfig } from "payload";

const Questions: CollectionConfig = {
  slug: "questions",
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    { name: "order", type: "number", required: true },
    {
      name: "label",
      type: "text",
      required: false,
    },
    { name: "defaultValue", type: "text", required: false },
    {
      name: "required",
      type: "checkbox",
    },
    {
      name: "selectOptions",
      type: "array",
      fields: [
        {
          name: "value",
          type: "text",
        },
      ],
    },
    {
      name: "type",
      type: "select",
      options: [
        { label: "Text", value: "text" },
        { label: "Number", value: "number" },
        { label: "Select", value: "select" },
        { label: "date", value: "date" },
        { label: "image", value: "image" },
        { label: "checkbox", value: "checkbox" },
        { label: "attachment", value: "attachment" },
      ],
    },
  ],
};

export default Questions;

