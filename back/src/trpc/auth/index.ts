import { router } from "../trpc.js";
import updateUser from "./updateUser.js";
import login from "./login.js";
const authRouter = router({ updateUser, login });
export default authRouter;
