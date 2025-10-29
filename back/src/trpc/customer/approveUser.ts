import { getPayload } from "../../db/getPayload.js";
import { privateProcedure } from "../trpc.js";
import { z } from "zod";

const approveUser = privateProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
  const payload = await getPayload;
  const updatedUser = await payload.update({
    collection: "appUsers",
    data: {
      isApproved: true,
    },
    id: input,
  });
  return { success: true };
});
export default approveUser;
