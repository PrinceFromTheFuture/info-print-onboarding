import { getPayload } from "../../db/getPayload.js";
import { privateProcedure } from "../trpc.js";
import { z } from "zod";

export const updateOrCreateSubmission = privateProcedure
  .input(
    z.object({
      questionId: z.string(),
      value: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const payload = await getPayload;

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check if there's already a submission for this question by this user
    const existingSubmissions = await payload.find({
      collection: "submissions",
      where: {
        and: [
          {
            question: {
              equals: input.questionId,
            },
          },
          {
            answeredBy: {
              equals: ctx.user?.id,
            },
          },
        ],
      },
      pagination: false,
    });

    // If a submission exists, update it
    if (existingSubmissions.docs.length > 0) {
      const existingSubmission = existingSubmissions.docs[0];
      const updatedSubmission = await payload.update({
        collection: "submissions",
        id: existingSubmission.id,
        data: {
          answer: input.value,
        },
      });
      return { submission: updatedSubmission, action: "updated" };
    }

    // If no submission exists, create a new one
    const newSubmission = await payload.create({
      collection: "submissions",
      data: {
        question: input.questionId,
        answeredBy: ctx.user?.id,
        answer: input.value,
      },
    });

    return { submission: newSubmission, action: "created" };
  });
