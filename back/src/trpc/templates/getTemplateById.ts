import { getPayload } from "../../db/getPayload.js";
import { privateProcedure } from "../trpc.js";
import { z } from "zod";
export const getTemplateById = privateProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .query(async ({ ctx, input }) => {
    const payload = await getPayload;
    const template = await payload.findByID({
      collection: "templates",
      id: input.id,
      depth: 90,
    });
    return template;
  });
