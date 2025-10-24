import { router } from "../trpc.js";
import clientSignUp from "./clientSignUp.js";
import { signUpCustomer } from "./signUpCustomer.js";
const authRouter = router({ signUpCustomer,clientSignUp });
export default authRouter;