import { getPayload } from "@/db/getPayload.js";
import { privateProcedure } from "../trpc.js";
import { z } from "zod";

export const deleteMediaHelper = async (mediaId: string) => {
  const payload = await getPayload;
  await payload.update({
    collection: "media",
    where: { id: { equals: mediaId } },
    data: { isDeleted: true },
  });
};

const deleteMedia = privateProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { id } = input;
    await deleteMediaHelper(id);
    return { success: true };
  });
export default deleteMedia;
