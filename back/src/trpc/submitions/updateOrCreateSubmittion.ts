import { TRPCError } from "@trpc/server";
import { getPayload } from "../../db/getPayload.js";
import { privateProcedure } from "../trpc.js";
import { z } from "zod";
import { deleteMediaHelper } from "../customer/deleteMedia.js";

export const updateOrCreateSubmission = privateProcedure
  .input(
    z.object({
      questionId: z.string(),
      value: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const payload = await getPayload;

    const question = await payload.findByID({
      collection: "questions",
      id: input.questionId,
      depth: 0,
    });
    if (!question) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Question not found" });
    }

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

      if (question.type === "image") {
        const { docs: medias } = await payload.find({
          collection: "media",

          pagination: false,
        });
        const media = medias.find((media) => media.url === existingSubmission?.answer?.replace(process.env.BACKEND_URL!, "")!);

        if (media) {
          await deleteMediaHelper(media.id);
        }
      }

      const updatedSubmission = await payload.update({
        collection: "submissions",
        id: existingSubmission.id,
        data: {
          answer: input.value,
        },
      });
      return { submission: updatedSubmission, action: "updated" };
    } else {
      const question = await payload.findByID({
        collection: "questions",
        id: input.questionId,
        depth: 10,
      });
      if (!question) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Question not found" });
      }
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
