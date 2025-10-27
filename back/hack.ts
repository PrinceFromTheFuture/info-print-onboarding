import { getPayload } from "src/db/getPayload.js";

const payload = await getPayload;

const users = await payload.find({
  collection: "appUsers",
  depth: 1,
  pagination: false,
});

console.log(users.docs.length);