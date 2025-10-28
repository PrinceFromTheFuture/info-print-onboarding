import { getPayload } from "src/db/getPayload.js";

const payload = await getPayload;
await payload.delete({
  collection: "assignments",
  where: {},
});
await payload.delete({
    collection: "templates",
    where: {},
  });
  