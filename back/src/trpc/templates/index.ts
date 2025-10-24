import { router } from "../trpc.js";
import assignTempalteToUser from "./assignTempalteToUser.js";
import { getFilledTemplateById } from "./getFilledTemplateById.js";
import getTemplates from "./getTemapltes.js";
import { getTemplateById } from "./getTemplateById.js";
import getTemplatesStats from "./getTemplatesStats.js";

export const templatesRouter = router({
  getTemplateById,
  getFilledTemplateById,
  getTemplatesStats,
  assignTempalteToUser,
  getTemplates,
});
