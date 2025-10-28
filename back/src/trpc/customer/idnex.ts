import { router } from "../trpc.js";
import { getUserMedia } from "./getUserMedia.js";
import getUserAssignedTemplates from "./getUserAssignedTemplates.js";
import onBoarding from "./onBoarding.js";

const customerRouter = router({
  getUserMedia,
  getUserAssignedTemplates,
  onBoarding
});

export default customerRouter;
