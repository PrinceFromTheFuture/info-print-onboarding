import { getPayload } from "src/db/getPayload";
import { privateProcedure } from "../trpc";
import dayjs from "dayjs";
const getAdminSubmissions = privateProcedure.query(async ({ ctx }) => {
    const payload = await getPayload;
    // Define time ranges
    const startOfThisWeek = dayjs().startOf("week").toISOString();
    const endOfThisWeek = dayjs().endOf("week").toISOString();
    const startOfLastWeek = dayjs().subtract(1, "week").startOf("week").toISOString();
    const endOfLastWeek = dayjs().subtract(1, "week").endOf("week").toISOString();
    const startOfTwoWeeksAgo = dayjs().subtract(2, "week").startOf("week").toISOString();
    // 1. TOTAL SUBMISSIONS STATISTICS
    // Fetch all submissions
    const allSubmissions = await payload.find({
        collection: "submissions",
        pagination: false,
        depth: 0,
    });
    const totalSubmissions = allSubmissions.totalDocs;
    // Get submissions CREATED this week (not updated)
    const submissionsThisWeek = await payload.find({
        collection: "submissions",
        where: {
            createdAt: {
                greater_than_equal: startOfThisWeek,
                less_than_equal: endOfThisWeek,
            },
        },
        pagination: false,
        depth: 0,
    });
    const submissionsCreatedThisWeek = submissionsThisWeek.totalDocs;
    // Get submissions CREATED last week (not updated)
    const submissionsLastWeek = await payload.find({
        collection: "submissions",
        where: {
            createdAt: {
                greater_than_equal: startOfLastWeek,
                less_than_equal: endOfLastWeek,
            },
        },
        pagination: false,
        depth: 0,
    });
    const submissionsCreatedLastWeek = submissionsLastWeek.totalDocs;
    // Calculate percentage change from last week
    const percentageChangeFromLastWeek = submissionsCreatedLastWeek > 0
        ? ((submissionsCreatedThisWeek - submissionsCreatedLastWeek) / submissionsCreatedLastWeek) * 100
        : submissionsCreatedThisWeek > 0
            ? 100
            : 0;
    const totalSubmissionsData = {
        total: totalSubmissions,
        createdThisWeek: submissionsCreatedThisWeek,
        createdLastWeek: submissionsCreatedLastWeek,
        percentageChange: Math.round(percentageChangeFromLastWeek * 100) / 100,
    };
    // 2. COMPLETION RATE CALCULATION
    // Get all active assignments to calculate overall completion rate
    const allActiveAssignments = await payload.find({
        collection: "assignments",
        depth: 3, // Deep fetch to get template -> sections -> groups -> questions
        pagination: false,
    });
    // Calculate total expected answers (each assignment * questions in template)
    let totalExpectedAnswers = 0;
    const allAssignmentQuestionIds = [];
    allActiveAssignments.docs.forEach((assignment) => {
        if (typeof assignment.template !== "string") {
            const template = assignment.template;
            const appUser = typeof assignment.appUser !== "string" ? assignment.appUser : null;
            // Count questions in this template
            let questionCount = 0;
            if (template.sections && Array.isArray(template.sections)) {
                template.sections.forEach((section) => {
                    if (typeof section !== "string") {
                        const sectionObj = section;
                        if (sectionObj.groups && Array.isArray(sectionObj.groups)) {
                            sectionObj.groups.forEach((group) => {
                                if (typeof group !== "string") {
                                    const groupObj = group;
                                    if (groupObj.questions && Array.isArray(groupObj.questions)) {
                                        questionCount += groupObj.questions.length;
                                        // Collect question IDs for this assignment
                                        groupObj.questions.forEach((question) => {
                                            const questionId = typeof question === "string" ? question : question.id;
                                            allAssignmentQuestionIds.push(questionId);
                                        });
                                    }
                                }
                            });
                        }
                    }
                });
            }
            // Each assignment creates questionCount expected answers
            totalExpectedAnswers += questionCount;
        }
    });
    // Count actual submissions across all assignments
    const totalActualSubmissions = await payload.find({
        collection: "submissions",
        pagination: false,
        depth: 0,
    });
    const totalAnswered = totalActualSubmissions.totalDocs;
    // Calculate completion rate
    const completionRate = totalExpectedAnswers > 0 ? (totalAnswered / totalExpectedAnswers) * 100 : 0;
    const completionRateData = {
        totalAnswered,
        totalExpectedAnswers,
        completionRate: Math.round(completionRate * 100) / 100,
    };
    // 3. ASSIGNED TEMPLATES DETAILS
    // Fetch all assignments with deep relationships
    const allAssignments = await payload.find({
        collection: "assignments",
        depth: 3,
        pagination: false,
    });
    // For each assignment, calculate submission counts
    const assignedTemplatesData = await Promise.all(allAssignments.docs.map(async (assignment) => {
        const appUser = typeof assignment.appUser !== "string" ? assignment.appUser : null;
        const template = typeof assignment.template !== "string" ? assignment.template : null;
        // Get all question IDs for this template
        const questionIds = [];
        if (template?.sections && Array.isArray(template.sections)) {
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
        let submissionCount = 0;
        let lastUpdatedSubmission = null;
        if (questionIds.length > 0 && appUser) {
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
                                equals: appUser.id,
                            },
                        },
                    ],
                },
                sort: "-updatedAt",
                limit: 1,
                pagination: false,
            });
            // Count all submissions for this assignment
            const allAssignmentSubmissions = await payload.find({
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
                                equals: appUser.id,
                            },
                        },
                    ],
                },
                pagination: false,
            });
            submissionCount = allAssignmentSubmissions.totalDocs;
            if (assignmentSubmissions.docs.length > 0) {
                lastUpdatedSubmission = assignmentSubmissions.docs[0].updatedAt;
            }
        }
        return {
            assignmentId: assignment.id,
            userId: appUser?.id || "Unknown",
            userEmail: appUser?.email || "Unknown",
            userName: appUser?.name || "Unknown",
            templateName: template?.name || "Unknown",
            templateId: template?.id || "Unknown",
            submissionCount,
            status: assignment.status,
            lastUpdatedSubmission,
            assignmentUpdatedAt: assignment.updatedAt,
        };
    }));
    return {
        totalSubmissionsData,
        completionRateData,
        assignedTemplates: assignedTemplatesData,
    };
});
export default getAdminSubmissions;
