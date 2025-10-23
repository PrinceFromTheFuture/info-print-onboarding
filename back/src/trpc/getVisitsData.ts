import { getPayload } from "src/db/getPayload";
import { privateProcedure } from "./trpc";

const getVisitsData = privateProcedure.query(async ({ ctx }) => {
  const payload = await getPayload;
  const { docs: visits } = await payload.find({
    collection: "visits",
   
    pagination: false,
    sort: "createdAt",
  });
  return visits;
});

export default getVisitsData;