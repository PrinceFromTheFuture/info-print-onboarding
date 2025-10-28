import { getPayload } from "src/db/getPayload.js";
import { privateProcedure } from "../trpc.js";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

// Input validation schema matching the frontend form
const onBoardingInputSchema = z
  .object({
    companyName: z.string().min(1, "Company name is required"),
    companyWebsiteUrl: z.string().url("Please enter a valid URL").min(1, "Company website is required"),
    requestedDomain: z
      .string()
      .min(1, "Requested domain is required")
      .regex(/^[a-zA-Z0-9-]+$/, "Domain can only contain letters, numbers, and hyphens"),
    administratorFullName: z.string().min(1, "Administrator full name is required"),
    administratorEmail: z
      .string()
      .email("Please enter a valid email")
      .min(1, "Administrator email is required"),
    administratorPhone: z.string().min(1, "Administrator phone is required"),
    printingShopSpecializations: z.array(z.string()),
    currentSalesTax: z
      .string()
      .min(1, "Sales tax is required")
      .refine((val) => !isNaN(parseFloat(val)), {
        message: "Please enter a valid number",
      }),
    quickBooksSyncing: z.boolean(),
    quickBooksSyncingOptions: z.string().optional(),
    logo: z.string().min(1, "Company logo is required"),
    contactAndCompanyList: z.string().min(1, "Contact & company list is required"),
    inventoryList: z.string().min(1, "Inventory list is required"),
    machineInformation: z.string().min(1, "Machine information is required"),
    additionalProductPricingInformation: z
      .string()
      .min(1, "Additional product pricing information is required"),
    currentMISWorkflow: z.string().min(10, "Please provide a detailed description (at least 10 characters)"),
    otherFeatures: z.array(z.string()),
  })
  .refine(
    (data) => {
      if (data.quickBooksSyncing) {
        return !!data.quickBooksSyncingOptions;
      }
      return true;
    },
    {
      message: "Please select a QuickBooks version",
      path: ["quickBooksSyncingOptions"],
    }
  );
  

const onBoarding = privateProcedure.input(onBoardingInputSchema).mutation(async ({ ctx, input }) => {
  const payload = await getPayload;

  // Fetch the full user data to check for existing config
  const user = await payload.findByID({
    collection: "appUsers",
    id: ctx.user!.id,
  });

  /*
  //TO-DO remove
  await payload.update({
    collection: "appUsers",
    id: ctx.user!.id,
    data: {
      appUserConfig: null,
    }, // Type assertion needed due to Payload's complex type system
  });
  */
  // Check if user already has a config
  /**/
  if (user.appUserConfig) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "User already has a configuration. Please contact support to update your configuration.",
    });
  }

  try {
    // Create the user config
    const userConfig = await payload.create({
      collection: "appUserConfigs",
      data: {
        companyName: input.companyName,
        administratorFullName: input.administratorFullName,
        administratorEmail: input.administratorEmail,
        administratorPhone: input.administratorPhone,
        companyWebsiteUrl: input.companyWebsiteUrl,
        printingShopSpecializations: input.printingShopSpecializations.map((spec) => ({
          specialization: spec,
        })),
        currentSalesTax: parseFloat(input.currentSalesTax),
        quickBooksSyncing: input.quickBooksSyncing,
        quickBooksSyncingOptions: input.quickBooksSyncingOptions as
          | "quickbooksOnline"
          | "quickbooksDesktop"
          | "quickbooksEnterprise",
        requestedDomain: input.requestedDomain,
        logo: input.logo,
        contactAndCompanyList: input.contactAndCompanyList,
        inventoryList: input.inventoryList,
        machineInformation: input.machineInformation,
        additionalProductPricingInformation: input.additionalProductPricingInformation,
        currentMISWorkflow: input.currentMISWorkflow,
        otherFeatures: input.otherFeatures.map((feature) => ({
          feature: feature,
        })),
      }, // Type assertion needed due to Payload's complex type system
    });

    // Update the user with the config relationship
    await payload.update({
      collection: "appUsers",
      id: ctx.user!.id,
      data: {
        appUserConfig: userConfig.id,
      }, // Type assertion needed due to Payload's complex type system
    });

    return {
      success: true,
      message: "Onboarding completed successfully!",
    };
  } catch (error) {
    console.error("Error creating user config:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to create user configuration. Please try again.",
    });
  }
});

export default onBoarding;
