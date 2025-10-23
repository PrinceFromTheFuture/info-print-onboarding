import type { CollectionConfig } from "payload";

const Visits: CollectionConfig = {
  slug: "visits",
  fields: [
    { type: "relationship", hasMany: false, relationTo: "appUsers", name: "appUser" },
    { type: "select", name: "type", options: ["mobile", "desktop"] },
  ],
};

export default Visits;