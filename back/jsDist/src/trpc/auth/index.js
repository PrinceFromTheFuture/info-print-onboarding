import { router } from "../trpc";
import { signUpCustomer } from "./signUpCustomer";
const authRouter = router({ signUpCustomer });
export default authRouter;
