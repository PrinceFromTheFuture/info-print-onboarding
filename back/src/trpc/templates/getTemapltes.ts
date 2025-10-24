import { getPayload } from "../../db/getPayload.js";
import { privateProcedure } from "../trpc.js";

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
