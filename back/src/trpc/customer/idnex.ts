import { router } from "../trpc.js";
import { getUserMedia } from "./getUserMedia.js";
import getUserAssignedTemplates from "./getUserAssignedTemplates.js";
import onBoarding from "./onBoarding.js";
import approveUser from "./approveUser.js";

const customerRouter = router({
  getUserMedia,
  getUserAssignedTemplates,
  onBoarding,
  approveUser
});

export default customerRouter;
