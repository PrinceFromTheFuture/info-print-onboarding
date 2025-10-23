import { router } from "../trpc";
import { updateOrCreateSubmission } from "./updateOrCreateSubmittion";

export const submittionsRouter = router({
    updateOrCreateSubmission
})