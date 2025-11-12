import { z } from "zod";
import { privateProcedure } from "../trpc.js";
import { getPayload } from "../../db/getPayload.js";
import type { AppUser, Assignment, Template as PayloadTemplate, Section, Group, Question, Media as PayloadMedia } from "../../payload-types.js";
import type { AppUserConfig } from "payload-types.js";

type Template = {
  id: string;
  name: string;
};

type Submission = {
  id: string;
  template: string;
  templateId: string;
  progress: number;
  completedAt: string | null;
  totalQuestions: number;
  answeredQuestions: number;
};

type MediaFile = {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
};

type Customer = {
  id: string;
  name: string;
  email: string;
  authEmail: string;
  role: string;
  createdAt: string;
  assignedTemplates: Template[];
  onboardingProgress: number;
  submissions: Submission[];
  media: MediaFile[];
  appUserConfig: AppUserConfig | null;
  isApproved: boolean;
};

const getCustomerDetailsById = privateProcedure.input(z.string()).query(async ({ ctx, input }) => {
  const payload = await getPayload;

  // 1. Fetch the customer by ID with deep relationships
  const customer = await payload.findByID({
    collection: "appUsers",
    id: input,
    depth: 9, // Increased depth to fetch media relationships
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  // 2. Fetch all assignments for this customer
  const assignments = await payload.find({
    collection: "assignments",
    where: {
      appUser: {
        equals: input,
      },
    },
    depth: 3, // Deep fetch to get template -> sections -> groups -> questions
    pagination: false,
  });

  // 3. Fetch all media uploaded by this customer
  const mediaFiles = await payload.find({
    collection: "media",
    where: {
      uploadedBy: {
        equals: input,
      },
      isDeleted: {
        equals: false,
      },
    },
    pagination: false,
  });

  // 4. Process assigned templates
  const assignedTemplates: Template[] = [];
  const templateMap = new Map<string, { name: string; totalQuestions: number }>();

  assignments.docs.forEach((assignment) => {
    const template = typeof assignment.template !== "string" ? (assignment.template as PayloadTemplate) : null;

    if (template && !templateMap.has(template.id)) {
      // Count total questions in this template
      let totalQuestions = 0;
      if (template.sections && Array.isArray(template.sections)) {
        template.sections.forEach((section) => {
          if (typeof section !== "string") {
            const sectionObj = section as Section;
            if (sectionObj.groups && Array.isArray(sectionObj.groups)) {
              sectionObj.groups.forEach((group) => {
                if (typeof group !== "string") {
                  const groupObj = group as Group;
                  if (groupObj.questions && Array.isArray(groupObj.questions)) {
                    totalQuestions += groupObj.questions.length;
                  }
                }
              });
            }
          }
        });
      }

      templateMap.set(template.id, { name: template.name, totalQuestions });
      assignedTemplates.push({
        id: template.id,
        name: template.name,
      });
    }
  });

  // 5. Process submissions for each assignment
  const submissions: Submission[] = await Promise.all(
    assignments.docs.map(async (assignment) => {
      const template = typeof assignment.template !== "string" ? (assignment.template as PayloadTemplate) : null;

      if (!template) {
        return null;
      }

      // Get all question IDs for this template
      const questionIds: string[] = [];
      if (template.sections && Array.isArray(template.sections)) {
        template.sections.forEach((section) => {
          if (typeof section !== "string") {
            const sectionObj = section as Section;
            if (sectionObj.groups && Array.isArray(sectionObj.groups)) {
              sectionObj.groups.forEach((group) => {
                if (typeof group !== "string") {
                  const groupObj = group as Group;
                  if (groupObj.questions && Array.isArray(groupObj.questions)) {
                    groupObj.questions.forEach((question) => {
                      const questionId = typeof question === "string" ? question : question.id;
                      questionIds.push(questionId);
                    });
                  }
                }
              });
            }
          }
        });
      }

      // Get submissions for this assignment's questions by this user
      const assignmentSubmissions = await payload.find({
        collection: "submissions",
        where: {
          and: [
            {
              question: {
                in: questionIds,
              },
            },
            {
              answeredBy: {
                equals: input,
              },
            },
          ],
        },
        pagination: false,
      });

      const totalQuestions = questionIds.length;
      const answeredQuestions = assignmentSubmissions.totalDocs;
      const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
      const completedAt = assignment.status === "submitted" ? assignment.updatedAt || null : null;

      return {
        id: assignment.id,
        template: template.name,
        templateId: template.id,
        progress: Math.round(progress * 100) / 100,
        completedAt,
        totalQuestions,
        answeredQuestions,
      };
    })
  ).then((results) => results.filter((item): item is Submission => item !== null));

  // 6. Process media files
  const media: MediaFile[] = mediaFiles.docs.map((file) => ({
    id: file.id,
    name: file.filename || "Unknown",
    type: file.mimeType || "Unknown",
    url: file.url || "",
    uploadedAt: file.createdAt,
  }));

  // 7. Calculate overall onboarding progress
  // Average progress across all submissions
  const onboardingProgress = submissions.length > 0 ? submissions.reduce((sum, s) => sum + s.progress, 0) / submissions.length : 0;

  // 8. Process appUserConfig media relationships
  let processedAppUserConfig = null;
  if (customer.appUserConfig) {
    const config = customer.appUserConfig as any;
    processedAppUserConfig = {
      ...config,
      logo: config.logo
        ? {
            id: config.logo.id,
            name: config.logo.filename || "Unknown",
            type: config.logo.mimeType || "Unknown",
            url: config.logo.url || "",
            uploadedAt: config.logo.createdAt,
          }
        : null,
      contactAndCompanyList: config.contactAndCompanyList
        ? {
            id: config.contactAndCompanyList.id,
            name: config.contactAndCompanyList.filename || "Unknown",
            type: config.contactAndCompanyList.mimeType || "Unknown",
            url: config.contactAndCompanyList.url || "",
            uploadedAt: config.contactAndCompanyList.createdAt,
          }
        : null,
      inventoryList: config.inventoryList
        ? {
            id: config.inventoryList.id,
            name: config.inventoryList.filename || "Unknown",
            type: config.inventoryList.mimeType || "Unknown",
            url: config.inventoryList.url || "",
            uploadedAt: config.inventoryList.createdAt,
          }
        : null,
      machineInformation: config.machineInformation
        ? {
            id: config.machineInformation.id,
            name: config.machineInformation.filename || "Unknown",
            type: config.machineInformation.mimeType || "Unknown",
            url: config.machineInformation.url || "",
            uploadedAt: config.machineInformation.createdAt,
          }
        : null,
      additionalProductPricingInformation: config.additionalProductPricingInformation
        ? {
            id: config.additionalProductPricingInformation.id,
            name: config.additionalProductPricingInformation.filename || "Unknown",
            type: config.additionalProductPricingInformation.mimeType || "Unknown",
            url: config.additionalProductPricingInformation.url || "",
            uploadedAt: config.additionalProductPricingInformation.createdAt,
          }
        : null,
    };
  }

  // 9. Build the customer response
  const customerData: Customer = {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    authEmail: customer.authEmail,
    role: customer.role || "customer",
    createdAt: customer.createdAt,
    assignedTemplates,
    appUserConfig: processedAppUserConfig,
    isApproved: customer.isApproved,
    onboardingProgress: Math.round(onboardingProgress * 100) / 100,
    submissions,
    media,
  };


  return customerData;
});

export default getCustomerDetailsById;
