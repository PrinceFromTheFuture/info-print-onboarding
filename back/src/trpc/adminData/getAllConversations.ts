import { getPayload } from "../../db/getPayload.js";
import { privateProcedure } from "../trpc.js";

const getAllConversations = privateProcedure.query(async ({ ctx }) => {
  const payload = await getPayload;
  const conversations = await payload.find({
    collection: "conversations",
  });
  return conversations;
});


export default getAllConversations;
