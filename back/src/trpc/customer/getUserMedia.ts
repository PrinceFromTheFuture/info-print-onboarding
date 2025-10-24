import { privateProcedure } from "../trpc.js";
import { getPayload } from "../../db/getPayload.js";

export const getUserMedia = privateProcedure.query(async ({ ctx }) => {
  const payload = await getPayload;

  const { docs: media } = await payload.find({
    collection: "media",
    where: {
      uploadedBy: {
        equals: ctx.user?.id,
      },
    },
    pagination: false,
  });
  return media;
});
