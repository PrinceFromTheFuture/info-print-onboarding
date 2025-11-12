import { getUserMedia } from "./customer/getUserMedia.js";
import { router } from "./trpc.js";
import { submittionsRouter } from "./submitions/index.js";
import { templatesRouter } from "./templates/index.js";
import authRouter from "./auth/index.js";
import reportVisit from "./reportVisit.js";
import getVisitsData from "./getVisitsData.js";
import adminDataRouter from "./adminData/index.js";
import customerRouter from "./customer/idnex.js";

import ticketsRouter from "./tickets/index.js";

export const appRouter = router({
  authRouter,
  submittionsRouter,
  customerRouter,
  adminDataRouter,
  templatesRouter,
  getUserMedia,
  reportVisit,
  getVisitsData,
  ticketsRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
