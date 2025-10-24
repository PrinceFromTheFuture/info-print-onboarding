import { auth } from "src/auth.js";
import { getPayload } from "src/db/getPayload.js";

const payload = await getPayload;

await payload.create({
  collection: "appUsers",
  data: {
    email: "eran1@test.com",
    name: "Test",
  },
});

await auth.api.signUpEmail({ body: { email: "eran1@test.com", password: "123123123", name: "Test" } });
