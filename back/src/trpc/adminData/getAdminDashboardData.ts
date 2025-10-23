import { getPayload } from "src/db/getPayload";
import { privateProcedure } from "../trpc";
import type { AppUser, Assignment, Submission, Template } from "../../../payload-types";
import dayjs from "dayjs";

const getAdminDashboardData = privateProcedure.query(async ({ ctx }) => {
  const payload = await getPayload;

  // Get today and yesterday dates using dayjs
  const startOfYesterday = dayjs().subtract(1, "day").startOf("day").toISOString();
  const endOfToday = dayjs().endOf("day").toISOString();

  // 1. Fetch all submissions based on createdAt from today and yesterday
  const recentSubmissions = await payload.find({
    collection: "submissions",
    where: {
      createdAt: {
        greater_than_equal: startOfYesterday,
        less_than_equal: endOfToday,
      },
    },
    depth: 2,
    pagination: false,
  });
  const SubmitionsCreationAvctivity = {
    createAtToday: recentSubmissions.docs.filter((sub) => dayjs(sub.createdAt).isSame(dayjs(), "day")).length,
    createAtYesterday: recentSubmissions.docs.filter((sub) => dayjs(sub.createdAt).isSame(dayjs().subtract(1, "day"), "day")).length,
  };

  // 2. Fetch all users created from today and yesterday
  const recentUsers = await payload.find({
    collection: "appUsers",
    where: {
      createdAt: {
        greater_than_equal: startOfYesterday,
        less_than_equal: endOfToday,
      },
    },
    depth: 1,
    pagination: false,
  });

  const custmersCreationAvctivity = {
    createAtToday: recentUsers.docs.filter((user) => dayjs(user.createdAt).isSame(dayjs(), "day")).length,
    createAtYesterday: recentUsers.docs.filter((user) => dayjs(user.createdAt).isSame(dayjs().subtract(1, "day"), "day")).length,
  };
  // 4. Fetch all templates at depth 0
  const allTemplates = await payload.find({
    collection: "templates",
    depth: 0,
    pagination: false,
  });
  const tempaltesCreationAvctivity = allTemplates.docs.length;

  // 5. Fetch last 5 updated assignments where status is submitted
  const recentSubmittedAssignments = await payload.find({
    collection: "assignments",
    where: {
      status: {
        equals: "submitted",
      },
    },
    sort: "-updatedAt",
    limit: 5,
    depth: 3,
    pagination: false,
  });
  const recentSubmittedAssignmentsAvctivity: { customerName: string; templateName: string; submitedAt: string }[] =
    recentSubmittedAssignments.docs.map((assignment) => ({
      customerName: typeof assignment.appUser === "string" ? "Unknown" : assignment.appUser?.name || "Unknown",
      templateName: typeof assignment.template === "string" ? "Unknown" : assignment.template?.name || "Unknown",
      submitedAt: assignment.updatedAt || assignment.createdAt,
    }));

  // 2. Fetch all users created from today and yesterday
  const last5UsersCreated = await payload.find({
    collection: "appUsers",
    sort: "-createdAt",
    limit: 5,
    depth: 1,
    pagination: false,
  });
  const last5UsersCreatedAssinmnets = await payload.find({
    collection: "assignments",
    where: {
      appUser: {
        in: last5UsersCreated.docs.map((user) => user.id),
      },
    },
    pagination: false,
  });

  const last5UsersCreatedAvctivity: { name: string; email: string; createdAt: string; assignments: number }[] = last5UsersCreated.docs.map(
    (user) => ({
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      assignments: last5UsersCreatedAssinmnets.docs.filter(
        (assignment) => assignment.appUser === user.id || (typeof assignment.appUser === "object" && assignment.appUser?.id === user.id)
      ).length,
    })
  );

  return {
    SubmitionsCreationAvctivity,
    custmersCreationAvctivity,
    tempaltesCreationAvctivity,
    recentSubmittedAssignmentsAvctivity,
    last5UsersCreatedAvctivity,
  };
});

export default getAdminDashboardData;
