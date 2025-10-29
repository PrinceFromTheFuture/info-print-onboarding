import { getPayload } from "src/db/getPayload.js";

const payload = await getPayload;
//@ts-ignore
const temp = await payload.update({
  collection: "appUsers",
  where: {
    id: {
      email: "amirwais.projects4@gmail.com",
    },
  },
  data: {
    isApproved: true,
  },
});

console.log(JSON.stringify(temp.docs.find((doc) => doc.email === "amirwais.projects4@gmail.com"), null, 2));
