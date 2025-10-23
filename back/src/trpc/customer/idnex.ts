import { router } from "../trpc";
import { getUserMedia } from "./getUserMedia";
import getUserAssignedTemplates from "./getUserAssigned";

const customerRouter = router({
  getUserMedia,
  getUserAssignedTemplates,
});

export default customerRouter;
