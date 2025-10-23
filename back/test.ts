import { getPayload } from "./src/db/getPayload";

const payload = await getPayload;

const template = await payload.findByID({
  collection: "templates",
  id: "68f90f91f486439df6333db0",
  depth: 90,
});

console.log(JSON.stringify(template, null, 2));
