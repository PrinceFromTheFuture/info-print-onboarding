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
      required: true,
      fields: [{ name: "specialization", type: "text", required: true }],
    },
    { name: "currentSalesTax", type: "number", required: true },
    { name: "quickBooksSyncing", type: "checkbox", required: true },
    {
      name: "quickBooksSyncingOptions",
      type: "select",
      required: true,
      options: [
        { label: "QuickBooks Online", value: "quickbooksOnline" },
        { label: "QuickBooks Desktop", value: "quickbooksDesktop" },
        { label: "QuickBooks Enterprise", value: "quickbooksEnterprise" },

      ],
    },
    {name:'requestedDomain',type:'text',required: true},
    {name:'logo',type:'relationship',relationTo:'media',required: true},
    {name:'contactAndCompanyList',type:'relationship',relationTo:'media',required: true},
    {name:'inventoryList',type:'relationship',relationTo:'media',required: true},
    {name:'machineInformation',type:'relationship',relationTo:'media',required: true},
    {name:'additionalProductPricingInformation',type:'relationship',relationTo:'media',required: true},
    {name:'currentMISWorkflow',type:'text',required: true},
    {name:'otherFeatures',type:'array',required: true, fields:[{name:'feature',type:'text',required: true}]},
  ],
};

export default UserConfigs;
