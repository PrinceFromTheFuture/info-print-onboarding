import { router } from "../trpc.js";
import { getUserMedia } from "./getUserMedia.js";
import getUserAssignedTemplates from "./getUserAssigned.js";

const customerRouter = router({
  getUserMedia,
  getUserAssignedTemplates,
});

export default customerRouter;
