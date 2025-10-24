import { signUpCustomer } from "./auth/signUpCustomer.js";
import { getUserMedia } from "./customer/getUserMedia.js";
import { getFilledTemplateById } from "./templates/getFilledTemplateById.js";
import { getTemplateById } from "./templates/getTemplateById.js";
import { updateOrCreateSubmission } from "./submitions/updateOrCreateSubmittion.js";
import { publicProcedure, router } from "./trpc.js";
import { submittionsRouter } from "./submitions/index.js";
import { templatesRouter } from "./templates/index.js";
import authRouter from "./auth/index.js";
import reportVisit from "./reportVisit.js";
import getAdminDashboardData from "./adminData/getAdminDashboardData.js";
import getCustomersData from "./adminData/getCustomersData.js";
import getVisitsData from "./getVisitsData.js";
import adminDataRouter from "./adminData/index.js";
import customerRouter from "./customer/idnex.js";
export const appRouter = router({
  authRouter,
  submittionsRouter,
  customerRouter,
  adminDataRouter,
  templatesRouter,
  getUserMedia,
  reportVisit,
  getVisitsData,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
