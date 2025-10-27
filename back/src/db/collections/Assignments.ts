import type { CollectionConfig } from "payload";

const Assignments: CollectionConfig = {
  slug: "assignments",
  fields: [
    { type: "relationship", hasMany: false, relationTo: "templates", name: "template" },
    { type: "relationship", hasMany: false, relationTo: "appUsers", name: "appUser" },
    {
      name: "status",
      type: "select",
      defaultValue: "inProgress",
      options: [
        { label: "inProgress", value: "inProgress" },
        { label: "submitted", value: "submitted" },
        { label: "pending", value: "pending" },
      ],
    },
  ],
};

export default Assignments;
