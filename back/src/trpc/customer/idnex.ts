import { router } from "../trpc.js";
import { getUserMedia } from "./getUserMedia.js";
import getUserAssignedTemplates from "./getUserAssignedTemplates.js";

const customerRouter = router({
  getUserMedia,
  getUserAssignedTemplates,
});

export default customerRouter;
