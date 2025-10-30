import { getPayload } from "../../db/getPayload.js";
import { privateProcedure, publicProcedure } from "../trpc.js";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { auth } from "../../auth.js";
import type { Media } from "payload-types.js";

const generateUnsecurePassword = ({ userName }: { userName: string }) => {
  return `${userName.toLowerCase()}1234567`;
};
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
    logo: z.string().optional(),
    contactAndCompanyList: z.string(),
    inventoryList: z.string().optional(),
    machineInformation: z.string().optional(),
    additionalProductPricingInformation: z.string().optional(),
    currentMISWorkflow: z.string(),
    otherFeatures: z.array(z.string()).optional(),
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

const onBoarding = publicProcedure.input(onBoardingInputSchema).mutation(async ({ ctx, input }) => {
  const payload = await getPayload;

  const userPassword = generateUnsecurePassword({ userName: input.administratorEmail.split("@")[0] });
  const user = await payload.create({
    collection: "appUsers",
    data: {
      email: input.administratorEmail,
      name: input.administratorFullName,
      role: "customer",
      isApproved: false,
    },
  });

  await auth.api.signUpEmail({
    body: {
      email: input.administratorEmail,
      password: userPassword,
      name: input.administratorFullName,
    },
  });

  const onBoardingDataMedia = [
    input.logo,
    input.contactAndCompanyList,
    input.inventoryList,
    input.machineInformation,
    input.additionalProductPricingInformation,
  ]
    .filter((s) => s !== "")
    .filter((s) => s !== undefined);

  for (const media of onBoardingDataMedia) {
    await payload.update({
      collection: "media",
      id: media,
      data: {
        uploadedBy: user.id,
      },
    });
  }
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
        printingShopSpecializations:
          input.printingShopSpecializations.map((spec) => ({
            specialization: spec,
          })) || [],
        currentSalesTax: parseFloat(input.currentSalesTax),
        quickBooksSyncing: input.quickBooksSyncing,
        quickBooksSyncingOptions:
          (input.quickBooksSyncingOptions as
            | "quickbooksOnline"
            | "quickbooksDesktop"
            | "quickbooksEnterprise") || null,
        requestedDomain: input.requestedDomain,
        logo: input.logo,
        contactAndCompanyList: input.contactAndCompanyList,
        inventoryList: input.inventoryList,
        machineInformation: input.machineInformation,
        additionalProductPricingInformation: input.additionalProductPricingInformation,
        currentMISWorkflow: input.currentMISWorkflow,
        otherFeatures: input.otherFeatures?.map((feature) => ({
          feature: feature,
        })),
      }, // Type assertion needed due to Payload's complex type system
    });

    // Update the user with the config relationship
    await payload.update({
      collection: "appUsers",
      id: user.id,
      data: {
        appUserConfig: userConfig.id,
      }, // Type assertion needed due to Payload's complex type system
    });

    return {
      success: true,
      userLoginData: {
        email: input.administratorEmail,
        password: userPassword,
      },
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
