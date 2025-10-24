import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { buildConfig } from "payload";
import AppUsers from "./collections/AppUsers.js";
import Sections from "./collections/Sections.js";
import Questions from "./collections/Questions.js";
import Templates from "./collections/Templates.js";
import Submissions from "./collections/Submissions.js";
import { Media } from "./collections/Media.js";
import { collections } from "./collections/index.js";

export default buildConfig({
  // If you'd like to use Rich Text, pass your editor here

  // Define and configure your collections in this array
  collections,

  // Your Payload secret - should be a complex and secure string, unguessable
  secret: process.env.PAYLOAD_SECRET || "",
  // Whichever Database Adapter you're using should go here
  // Mongoose is shown as an example, but you can also use Postgres
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || "",
  }),
});
