import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  upload: {
    staticDir: "media",
    adminThumbnail: "thumbnail",
  },
  fields: [
    { name: "uploadedBy", type: "relationship", relationTo: "appUsers", defaultValue: undefined },
    {
      name: "alt",
      type: "text",
    },
    { type: "text", name: "extention" },
  ],
};
