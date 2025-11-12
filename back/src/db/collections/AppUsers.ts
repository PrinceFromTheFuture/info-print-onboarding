import type { CollectionConfig } from "payload";

const AppUsers: CollectionConfig = {
  slug: "appUsers",

  fields: [
    { name: "appUserConfig", type: "relationship", relationTo: "appUserConfigs", required: false },
    { name: "isApproved", type: "checkbox", required: true, defaultValue: false },
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "email",
      type: "text",
      required: true,
    },
    {
      name: "authEmail",
      type: "text",
      required: true,
    },
    {
      name: "role",
      type: "select",
      options: [
        {
          label: "Admin",
          value: "admin",
        },
        {
          label: "Customer",
          value: "customer",
        },
      ],
    },
    {
      name: "assignedTemplates",
      type: "relationship",
      relationTo: "templates",
      hasMany: true,
    },
  ],
};

export default AppUsers;
