import { getPayload } from "src/db/getPayload";
import { privateProcedure } from "../trpc";
import { z } from "zod";
import type { Template, Section, Group, Question, Submission } from "../../../payload-types";

export const getFilledTemplateById = privateProcedure
  .input(
    z.object({
      id: z.string(),
      userId: z.string().optional(),
    })
  )
  .query(async ({ ctx, input }) => {
    const payload = await getPayload;
    const userId = input.userId || ctx.user?.id;

    // Get the template with all relationships populated
    const template = await payload.findByID({
      collection: "templates",
      id: input.id,
      depth: 90,
    });

    // Get all submissions for the current user
    const userSubmissions = await payload.find({
      collection: "submissions",
      where: {
        answeredBy: {
          equals: userId,
        },
      },
      depth: 1,
      pagination: false,
    });

    // Create a map of question ID to submission for quick lookup
    const submissionMap = new Map<string, Submission>();
    userSubmissions.docs.forEach((submission) => {
      const questionId = typeof submission.question === "string" ? submission.question : submission.question?.id;
      if (questionId) {
        submissionMap.set(questionId, submission);
      }
    });

    // Helper function to add answer to a question
    const addAnswerToQuestion = (question: Question | string) => {
      if (typeof question === "string") return question;

      const submission = submissionMap.get(question.id);
      return {
        ...question,
        answer: submission?.answer || null,
      };
    };

    // Traverse the template structure and add answers to questions
    const populatedTemplate = {
      ...template,
      sections: template.sections?.map((section) => {
        if (typeof section === "string") return section;

        return {
          ...section,
          groups: (section as Section).groups?.map((group) => {
            if (typeof group === "string") return group;

            return {
              ...group,
              questions: (group as Group).questions?.map(addAnswerToQuestion),
            };
          }),
        };
      }),
    };

    return populatedTemplate;
  });
