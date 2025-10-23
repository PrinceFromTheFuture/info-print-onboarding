import { z } from "zod";
import { privateProcedure } from "../trpc";
import { getPayload } from "src/db/getPayload";
const getCustomerDetailsById = privateProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const payload = await getPayload;
    // 1. Fetch the customer by ID
    const customer = await payload.findByID({
        collection: "appUsers",
        id: input,
        depth: 1,
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
        },
        pagination: false,
    });
    // 4. Process assigned templates
    const assignedTemplates = [];
    const templateMap = new Map();
    assignments.docs.forEach((assignment) => {
        const template = typeof assignment.template !== "string" ? assignment.template : null;
        if (template && !templateMap.has(template.id)) {
            // Count total questions in this template
            let totalQuestions = 0;
            if (template.sections && Array.isArray(template.sections)) {
                template.sections.forEach((section) => {
                    if (typeof section !== "string") {
                        const sectionObj = section;
                        if (sectionObj.groups && Array.isArray(sectionObj.groups)) {
                            sectionObj.groups.forEach((group) => {
                                if (typeof group !== "string") {
                                    const groupObj = group;
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
    const submissions = await Promise.all(assignments.docs.map(async (assignment) => {
        const template = typeof assignment.template !== "string" ? assignment.template : null;
        if (!template) {
            return null;
        }
        // Get all question IDs for this template
        const questionIds = [];
        if (template.sections && Array.isArray(template.sections)) {
            template.sections.forEach((section) => {
                if (typeof section !== "string") {
                    const sectionObj = section;
                    if (sectionObj.groups && Array.isArray(sectionObj.groups)) {
                        sectionObj.groups.forEach((group) => {
                            if (typeof group !== "string") {
                                const groupObj = group;
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
    })).then((results) => results.filter((item) => item !== null));
    // 6. Process media files
    const media = mediaFiles.docs.map((file) => ({
        id: file.id,
        name: file.filename || "Unknown",
        type: file.mimeType || "Unknown",
        uploadedAt: file.createdAt,
    }));
    // 7. Calculate overall onboarding progress
    // Average progress across all submissions
    const onboardingProgress = submissions.length > 0 ? submissions.reduce((sum, s) => sum + s.progress, 0) / submissions.length : 0;
    // 8. Build the customer response
    const customerData = {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        role: customer.role || "customer",
        createdAt: customer.createdAt,
        assignedTemplates,
        onboardingProgress: Math.round(onboardingProgress * 100) / 100,
        submissions,
        media,
    };
    return customerData;
});
export default getCustomerDetailsById;
