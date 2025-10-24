import { router } from "../trpc.js";
import getAdminCustomersData from "./getAdminCustomersData.js";
import getAdminDashboardData from "./getAdminDashboardData.js";
import getAdminSubmissions from "./getAdminSubmissions.js";
import getCustomerDetailsById from "./getCustmerDetailsById.js";
import getCustomersData from "./getCustomersData.js";
const adminDataRouter = router({ getCustomersData, getAdminCustomersData, getAdminDashboardData, getAdminSubmissions, getCustomerDetailsById });
export default adminDataRouter;
