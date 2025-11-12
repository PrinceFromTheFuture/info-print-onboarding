import { router } from "../trpc.js";
import { getUserMedia } from "./getUserMedia.js";
import getUserAssignedTemplates from "./getUserAssignedTemplates.js";
import onBoarding from "./onBoarding.js";
import approveUser from "./approveUser.js";
import deleteMedia from "./deleteMedia.js";

const customerRouter = router({
  getUserMedia,
  getUserAssignedTemplates,
  onBoarding,
  approveUser,
  deleteMedia,
});

export default customerRouter;
