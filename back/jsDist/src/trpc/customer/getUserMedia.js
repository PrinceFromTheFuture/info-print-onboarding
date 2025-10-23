import { privateProcedure } from "../trpc";
import { getPayload } from "../../db/getPayload";
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
