import { router } from "../trpc";
import getAdminCustomersData from "./getAdminCustomersData";
import getAdminDashboardData from "./getAdminDashboardData";
import getAdminSubmissions from "./getAdminSubmissions";
import getCustomerDetailsById from "./getCustmerDetailsById";
import getCustomersData from "./getCustomersData";
const adminDataRouter = router({ getCustomersData, getAdminCustomersData, getAdminDashboardData, getAdminSubmissions, getCustomerDetailsById });
export default adminDataRouter;
