"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { authClient, useSession } from "@/lib/auth/auth-client";
import { toast } from "sonner";
import { useTRPC, useTRPCClient } from "@/trpc/trpc";
import { ChevronLeft, ChevronRight, Building2, UserCircle, Settings, CreditCard, FileText, Sparkles } from "lucide-react";

// Import stage components
import { CompanyInformationStage } from "./stages/company-information-stage";
import { AdministratorDetailsStage } from "./stages/administrator-details-stage";
import { BusinessConfigurationStage } from "./stages/business-configuration-stage";
import { QuickBooksIntegrationStage } from "./stages/quickbooks-integration-stage";
import { DocumentUploadsStage } from "./stages/document-uploads-stage";
import { AdditionalDetailsStage } from "./stages/additional-details-stage";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

// Zod Schemas for each stage
const companyInformationSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  companyWebsiteUrl: z.string().url("Please enter a valid URL").min(1, "Company website is required"),
  requestedDomain: z
    .string()
    .min(1, "Requested domain is required")
    .regex(/^[a-zA-Z0-9-]+$/, "Domain can only contain letters, numbers, and hyphens"),
});

const administratorDetailsSchema = z.object({
  administratorFullName: z.string().min(1, "Administrator full name is required"),
  administratorEmail: z.string().email("Please enter a valid email").min(1, "Administrator email is required"),
  administratorPhone: z.string().min(1, "Administrator phone is required"),
});

const businessConfigurationSchema = z.object({
  printingShopSpecializations: z.array(z.string()),
  currentSalesTax: z
    .string()
    .min(1, "Sales tax is required")
    .refine((val) => !isNaN(parseFloat(val)), {
      message: "Please enter a valid number",
    }),
});

const quickBooksIntegrationSchema = z
  .object({
    quickBooksSyncing: z.boolean(),
    quickBooksSyncingOptions: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.quickBooksSyncing) {
        return !!data.quickBooksSyncingOptions && data.quickBooksSyncingOptions.trim() !== "";
      }
      return true;
    },
    {
      message: "Please select a QuickBooks version",
      path: ["quickBooksSyncingOptions"],
    }
  );

const fileUploadSchema = z.object({
  mediaId: z.string(),
  fileName: z.string(),
  fileUrl: z.string(),
  fileType: z.string(),
});

const documentUploadsSchema = z.object({
  logo: fileUploadSchema.optional(),
  contactAndCompanyList: fileUploadSchema.optional(),
  inventoryList: fileUploadSchema.optional(),
  machineInformation: fileUploadSchema.optional(),
  additionalProductPricingInformation: fileUploadSchema.optional(),
});

const additionalDetailsSchema = z.object({
  currentMISWorkflow: z.string().optional(),
  otherFeatures: z.array(z.string()).optional(),
});

// Combined schema
const accountSetupSchema = z.object({
  ...companyInformationSchema.shape,
  ...administratorDetailsSchema.shape,
  ...businessConfigurationSchema.shape,
  ...quickBooksIntegrationSchema.shape,
  ...documentUploadsSchema.shape,
  ...additionalDetailsSchema.shape,
});

export type AccountSetupFormData = z.infer<typeof accountSetupSchema>;
export type AccountSetupForm = UseFormReturn<AccountSetupFormData>;

function AccountSetUp() {
  const [stage, setStage] = useState(0);
  const stagesCount = 6;
  const { data: session } = useSession();
  const router = useRouter();

  const trpc = useTRPC();
  const onBoardingMutation = useMutation(
    trpc.customerRouter.onBoarding.mutationOptions({
      onSuccess: async (data) => {
        toast.success("Account setup completed successfully!");
        if (data.userLoginData) {
          await authClient.signIn.email(
            {
              email: data.userLoginData.email,
              password: data.userLoginData.password,
            },
            { redirect: "manual" }
          );
          router.push("/login");
        }
      },
      onError: (error: any) => {
        toast.error("Failed to complete account setup. Please try again.");
        console.error("Account setup error:", error);
      },
    })
  );

  // React Hook Form
  const form = useForm<AccountSetupFormData>({
    resolver: zodResolver(accountSetupSchema),
    mode: "onChange",
    defaultValues: {
      companyName: "",
      companyWebsiteUrl: "",
      requestedDomain: "",
      administratorFullName: "",
      administratorEmail: "",
      administratorPhone: "",
      printingShopSpecializations: [],
      currentSalesTax: "",
      quickBooksSyncing: false,
      quickBooksSyncingOptions: "",
      logo: { mediaId: "", fileName: "", fileUrl: "", fileType: "" },
      contactAndCompanyList: { mediaId: "", fileName: "", fileUrl: "", fileType: "" },
      inventoryList: { mediaId: "", fileName: "", fileUrl: "", fileType: "" },
      machineInformation: { mediaId: "", fileName: "", fileUrl: "", fileType: "" },
      additionalProductPricingInformation: { mediaId: "", fileName: "", fileUrl: "", fileType: "" },
      currentMISWorkflow: "",
      otherFeatures: [],
    },
  });

  const stageInfo = [
    { title: "Company Information", icon: Building2, description: "Tell us about your company" },
    { title: "Administrator Details", icon: UserCircle, description: "Primary contact information" },
    { title: "Business Configuration", icon: Settings, description: "Specializations and tax settings" },
    { title: "QuickBooks Integration", icon: CreditCard, description: "Connect your accounting software" },
    { title: "Document Uploads", icon: FileText, description: "Upload important files" },
    { title: "Additional Details", icon: Sparkles, description: "Workflow and features" },
  ];

  // Stage validation mapping
  const stageValidationFields = [
    ["companyName", "companyWebsiteUrl", "requestedDomain"],
    ["administratorFullName", "administratorEmail", "administratorPhone"],
    ["printingShopSpecializations", "currentSalesTax"],
    ["quickBooksSyncing"], // Only validate quickBooksSyncing, quickBooksSyncingOptions will be validated by the schema
    ["logo", "contactAndCompanyList", "inventoryList", "machineInformation", "additionalProductPricingInformation"],
    ["currentMISWorkflow", "otherFeatures"],
  ];

  // Validate current stage
  const validateStage = async () => {
    const fieldsToValidate = stageValidationFields[stage] as (keyof AccountSetupFormData)[];

    // Special handling for QuickBooks stage - validate the entire schema for this stage
    if (stage === 3) {
      const quickBooksData = {
        quickBooksSyncing: form.getValues("quickBooksSyncing"),
        quickBooksSyncingOptions: form.getValues("quickBooksSyncingOptions"),
      };
      const quickBooksResult = quickBooksIntegrationSchema.safeParse(quickBooksData);

      if (!quickBooksResult.success) {
        // Set the form error for the specific field
        const error = quickBooksResult.error.issues[0];
        if (error.path[0] === "quickBooksSyncingOptions") {
          form.setError("quickBooksSyncingOptions", {
            type: "manual",
            message: error.message,
          });
        }
      }

      return quickBooksResult.success;
    }

    const result = await form.trigger(fieldsToValidate);
    return result;
  };

  const nextStage = async () => {
    const isValid = await validateStage();
    if (!isValid) {
      // Show specific error message for QuickBooks stage
      if (stage === 3) {
        const quickBooksSyncing = form.getValues("quickBooksSyncing");
        if (quickBooksSyncing) {
          toast.error("Please select a QuickBooks version to continue");
        } else {
          toast.error("Please fill in all required fields correctly");
        }
      } else {
        toast.error("Please fill in all required fields correctly");
      }
      return;
    }
    if (stage < stagesCount - 1) {
      setStage(stage + 1);
    }
  };

  const prevStage = () => {
    if (stage > 0) setStage(stage - 1);
  };

  const onSubmit = async (data: AccountSetupFormData) => {
    // Extract mediaIds from file objects for backend submission
    const submissionData = {
      ...data,
      logo: data.logo.mediaId,
      contactAndCompanyList: data.contactAndCompanyList.mediaId,
      inventoryList: data.inventoryList.mediaId,
      machineInformation: data.machineInformation.mediaId,
      additionalProductPricingInformation: data.additionalProductPricingInformation.mediaId,
    };

    await onBoardingMutation.mutateAsync(submissionData);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Only allow submission on the last stage
    if (stage === stagesCount - 1) {
      await form.handleSubmit(onSubmit)(e);
    }
  };

  const handleCompleteSetup = async (e: React.MouseEvent) => {
    e.preventDefault();
    // Ensure we're on the last stage before submitting
    if (stage === stagesCount - 1) {
      await form.handleSubmit(onSubmit)();
    }
  };

  const CurrentIcon = stageInfo[stage].icon;

  return (
    <form onSubmit={handleFormSubmit} className="w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-3">
          <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
            <CurrentIcon className="size-5 sm:size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl mb-0.5 font-bold">{stageInfo[stage].title}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">{stageInfo[stage].description}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full flex justify-between gap-1.5 sm:gap-2 mb-6 sm:mb-8">
        {Array.from({ length: stagesCount }).map((_, index) => (
          <div key={index} className="w-full h-1 rounded-full bg-primary/20 relative">
            <motion.div
              className="h-full rounded-full bg-primary absolute inset-0"
              initial={{ width: 0 }}
              animate={{ width: index <= stage ? "100%" : 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            />
          </div>
        ))}
      </div>

      {/* Form Content */}
      <ScrollArea className="h-[calc(100vh-200px)] sm:h-[calc(100vh-220px)] lg:h-[calc(100vh-280px)] pr-2 sm:pr-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-6 sm:mb-8 px-1"
          >
            {stage === 0 && <CompanyInformationStage form={form} />}
            {stage === 1 && <AdministratorDetailsStage form={form} />}
            {stage === 2 && <BusinessConfigurationStage form={form} />}
            {stage === 3 && <QuickBooksIntegrationStage form={form} />}
            {stage === 4 && <DocumentUploadsStage form={form} userId={session?.user?.id} />}
            {stage === 5 && <AdditionalDetailsStage form={form} />}
          </motion.div>
        </AnimatePresence>
      </ScrollArea>

      <div className="lg:w-full lg:static flex justify-between items-center fixed gap-12 mt-8 right-8 left-8 bottom-8">
        <Button
          type="button"
          variant="outline"
          onClick={prevStage}
          disabled={stage === 0}
          className="gap-1 flex-1 sm:gap-2 text-xs sm:text-sm"
          size="lg"
        >
          <ChevronLeft className="size-3 sm:size-4" />
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">Prev</span>
        </Button>

        <div className="text-xs sm:text-sm text-muted-foreground font-medium">
          {stage + 1}/{stagesCount}
        </div>

        {stage === stagesCount - 1 ? (
          <Button
            type="button"
            onClick={handleCompleteSetup}
            className="gap-1 flex-1 sm:gap-2 text-xs sm:text-sm"
            size="lg"
            disabled={onBoardingMutation.isPending}
          >
            <span className="hidden sm:inline">{onBoardingMutation.isPending ? "Completing..." : "Complete Setup"}</span>
            <span className="sm:hidden">{onBoardingMutation.isPending ? "..." : "Complete"}</span>
            <Sparkles className="size-3 sm:size-4" />
          </Button>
        ) : (
          <Button type="button" onClick={nextStage} className="gap-1 flex-1 sm:gap-2 text-xs sm:text-sm" size="lg">
            Next
            <ChevronRight className="size-3 sm:size-4" />
          </Button>
        )}
      </div>
    </form>
  );
}

export default AccountSetUp;
