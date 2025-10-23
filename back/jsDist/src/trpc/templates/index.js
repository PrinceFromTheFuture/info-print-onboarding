import { router } from "../trpc";
import assignTempalteToUser from "./assignTempalteToUser";
import { getFilledTemplateById } from "./getFilledTemplateById";
import getTemplates from "./getTemapltes";
import { getTemplateById } from "./getTemplateById";
import getTemplatesStats from "./getTemplatesStats";
export const templatesRouter = router({
    getTemplateById,
    getFilledTemplateById,
    getTemplatesStats,
    assignTempalteToUser,
    getTemplates,
});
