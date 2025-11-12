import { privateProcedure } from "../trpc.js";
import { z } from "zod";
import { getPayload } from "../../db/getPayload.js";
const updateUser = privateProcedure
  .input(
    z.object({
      email: z.string(),
      name: z.string(),
      id: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { email, name } = input;
    const payload = await getPayload;
    const t = await payload.update({
      collection: "appUsers",
      id: input.id,
      data: { email, name },
    });
    console.log(t);
    return { success: true, message: "User updated successfully" };
  });
export default updateUser;
