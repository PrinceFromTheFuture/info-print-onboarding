import { getPayload } from "../db/getPayload.js";
import { privateProcedure } from "./trpc.js";
import { z } from "zod";

const reportVisit = privateProcedure.input(z.object({ type: z.enum(["mobile", "desktop"]) })).mutation(async ({ ctx, input }) => {
  const payload = await getPayload;
  await payload.create({
    collection: "visits",
    data: {
      type: input.type,
      appUser: ctx.user?.id,
    },
  });
});
export default reportVisit;
