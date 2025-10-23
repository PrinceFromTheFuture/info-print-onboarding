import { getPayload } from "src/db/getPayload";
import { privateProcedure } from "../trpc";

export const getTemplatesStats = privateProcedure.query(async ({ ctx }) => {
  const payload = await getPayload;
  const templates = await payload.find({
    collection: "templates",
    depth: 0,
    pagination: false,
  });
  const assignments = await payload.find({
    collection: "assignments",
    depth: 0,
    pagination: false,
  });
  const formatedAssignments = templates.docs.map((template) => {
    console.log(template.sections);
    return {
      id: template.id,
      name: template.name,
      description: template.description,
      sections: template.sections?.filter((section) => section !== null).length,
      lastUpdates: template.updatedAt,
      assignedAndSubmitted: assignments.docs.filter((assignment) => assignment.template === template.id && assignment.status === "submitted").length,
      assigned: assignments.docs.filter((assignment) => assignment.template === template.id).length,
    };
  });
  return formatedAssignments;
});
export default getTemplatesStats;
