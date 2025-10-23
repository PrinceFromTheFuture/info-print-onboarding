import { signUpCustomer } from "./auth/signUpCustomer";
import { getUserMedia } from "./customer/getUserMedia";
import { getFilledTemplateById } from "./templates/getFilledTemplateById";
import { getTemplateById } from "./templates/getTemplateById";
import { updateOrCreateSubmission } from "./submitions/updateOrCreateSubmittion";
import { publicProcedure, router } from "./trpc";
import { submittionsRouter } from "./submitions";
import { templatesRouter } from "./templates";
import authRouter from "./auth";
import reportVisit from "./reportVisit";
import getAdminDashboardData from "./adminData/getAdminDashboardData";
import getCustomersData from "./adminData/getCustomersData";
import getVisitsData from "./getVisitsData";
import adminDataRouter from "./adminData";
import customerRouter from "./customer/idnex";
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
