import type { CollectionConfig } from "payload";

const UserConfigs: CollectionConfig = {
  slug: "appUserConfigs",

  fields: [
    { name: "companyName", type: "text", required: true },
    { name: "administratorFullName", type: "text", required: true },
    { name: "administratorEmail", type: "text", required: true },
    { name: "administratorPhone", type: "text", required: true },
    { name: "companyWebsiteUrl", type: "text", required: true },
    {
      name: "printingShopSpecializations",
      type: "array",
      required: false,
      defaultValue: [],

      fields: [{ name: "specialization", type: "text" }],
    },
    { name: "currentSalesTax", type: "number", required: true },
    { name: "quickBooksSyncing", type: "checkbox", defaultValue: false },
    {
      name: "quickBooksSyncingOptions",
      type: "select",
      required: false,
      options: [
        { label: "QuickBooks Online", value: "quickbooksOnline" },
        { label: "QuickBooks Desktop", value: "quickbooksDesktop" },
        { label: "QuickBooks Enterprise", value: "quickbooksEnterprise" },
      ],
    },
    { name: "requestedDomain", type: "text", required: true },
    { name: "logo", type: "relationship", relationTo: "media", required: false },
    { name: "contactAndCompanyList", type: "relationship", relationTo: "media", required: false },
    { name: "inventoryList", type: "relationship", relationTo: "media", required: false },
    { name: "machineInformation", type: "relationship", relationTo: "media", required: false },
    {
      name: "additionalProductPricingInformation",
      type: "relationship",
      relationTo: "media",
      required: false,
    },
    { name: "currentMISWorkflow", type: "text", required: false },
    {
      name: "otherFeatures",
      type: "array",
      required: false,
      fields: [
        {
          name: "feature",
          type: "text",

          defaultValue: [],
        },
      ],
    },
  ],
};

export default UserConfigs;
