import { getPayload } from "src/db/getPayload";
import { privateProcedure } from "../trpc";
const getTemplates = privateProcedure.query(async ({ ctx }) => {
    const payload = await getPayload;
    const templates = await payload.find({
        collection: "templates",
        pagination: false,
        depth: 1,
    });
    return templates.docs;
});
export default getTemplates;
