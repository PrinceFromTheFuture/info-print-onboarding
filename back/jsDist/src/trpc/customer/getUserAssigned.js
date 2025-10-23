import { privateProcedure } from "../trpc";
import { getPayload } from "src/db/getPayload";
const getUserAssignedTemplates = privateProcedure.query(async ({ ctx }) => {
    const payload = await getPayload;
    const userId = ctx.user?.id;
    if (!userId) {
        throw new Error("User not authenticated");
    }
    // Get all assignments for the current user
    const assignments = await payload.find({
        collection: "assignments",
        where: {
            appUser: {
                equals: userId,
            },
        },
        depth: 2, // Get template data populated
    });
    // Build the response with progress for each assignment
    const assignmentsWithProgress = await Promise.all(assignments.docs.map(async (assignment) => {
        const template = assignment.template;
        const templateId = typeof template === "object" ? template.id : template;
        // Get full template with all nested relationships
        const fullTemplate = await payload.findByID({
            collection: "templates",
            id: templateId,
            depth: 3, // Get sections -> groups -> questions
        });
        // Collect all question IDs from the template
        const questionIds = [];
        if (fullTemplate.sections && Array.isArray(fullTemplate.sections)) {
            for (const section of fullTemplate.sections) {
                const sectionObj = typeof section === "object" ? section : null;
                if (sectionObj?.groups && Array.isArray(sectionObj.groups)) {
                    for (const group of sectionObj.groups) {
                        const groupObj = typeof group === "object" ? group : null;
                        if (groupObj?.questions && Array.isArray(groupObj.questions)) {
                            for (const question of groupObj.questions) {
                                const questionId = typeof question === "object" ? question.id : question;
                                questionIds.push(questionId);
                            }
                        }
                    }
                }
            }
        }
        const totalQuestions = questionIds.length;
        // Count how many submissions the user has made for this template's questions
        const submissions = await payload.find({
            collection: "submissions",
            where: {
                and: [
                    {
                        answeredBy: {
                            equals: userId,
                        },
                    },
                    {
                        question: {
                            in: questionIds,
                        },
                    },
                ],
            },
            limit: 0, // We only need the count
        });
        const completedQuestions = submissions.totalDocs;
        return {
            assignmentId: assignment.id,
            status: assignment.status,
            templateId: fullTemplate.id,
            templateName: fullTemplate.name,
            templateDescription: fullTemplate.description || "",
            progress: {
                completed: completedQuestions,
                total: totalQuestions,
                percentage: totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 100) : 0,
            },
        };
    }));
    return assignmentsWithProgress;
});
export default getUserAssignedTemplates;
