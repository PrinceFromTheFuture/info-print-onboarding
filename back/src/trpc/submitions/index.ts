import { router } from "../trpc.js";
import submitAssignment from "./submitAssignment.js";
import { updateOrCreateSubmission } from "./updateOrCreateSubmittion.js";

export const submittionsRouter = router({
    updateOrCreateSubmission,
    submitAssignment
})