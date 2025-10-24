import { getPayload } from "../../db/getPayload.js";
import { privateProcedure } from "../trpc.js";
import type { AppUser, Assignment, Submission, Template } from "../../payload-types.js";
import dayjs from "dayjs";

const getAdminCustomersData = privateProcedure.query(async ({ ctx }) => {
  const payload = await getPayload;

  // Get today and yesterday dates using dayjs
  const startOfYesterday = dayjs().subtract(1, "day").startOf("day").toISOString();
  const endOfToday = dayjs().endOf("day").toISOString();

  // Get week boundaries for active users calculation
  const startOfThisWeek = dayjs().startOf("week").toISOString();
  const endOfThisWeek = dayjs().endOf("week").toISOString();

  // Get two weeks ago for assignment completion rate
  const startOfTwoWeeksAgo = dayjs().subtract(2, "week").startOf("week").toISOString();
  const endOfTwoWeeksAgo = dayjs().subtract(2, "week").endOf("week").toISOString();

  // 1. Fetch all users created from today and yesterday (existing functionality)
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

  // 2. Fetch assignments from last two weeks for both active users and completion rate calculation
  const assignmentsLastTwoWeeks = await payload.find({
    collection: "assignments",
    where: {
      updatedAt: {
        greater_than_equal: startOfTwoWeeksAgo,
        less_than_equal: endOfThisWeek,
      },
    },
    depth: 1,
    pagination: false,
  });

  // Calculate completion rates for this week and last week
  const assignmentsThisWeek = assignmentsLastTwoWeeks.docs.filter((assignment) =>
    dayjs(assignment.updatedAt || assignment.createdAt).isSame(dayjs(), "week")
  );

  const assignmentsLastWeek = assignmentsLastTwoWeeks.docs.filter((assignment) =>
    dayjs(assignment.updatedAt || assignment.createdAt).isSame(dayjs().subtract(1, "week"), "week")
  );

  const completedAssignmentsThisWeek = assignmentsThisWeek.filter((assignment) => assignment.status === "submitted").length;
  const completedAssignmentsLastWeek = assignmentsLastWeek.filter((assignment) => assignment.status === "submitted").length;

  const assignmentCompletionActivity = {
    completionRateThisWeek: assignmentsThisWeek.length > 0 ? (completedAssignmentsThisWeek / assignmentsThisWeek.length) * 100 : 0,
    completionRateLastWeek: assignmentsLastWeek.length > 0 ? (completedAssignmentsLastWeek / assignmentsLastWeek.length) * 100 : 0,
  };

  // 3. Find unique users who worked on assignments (active users) this week and last week
  const activeUsersThisWeek = new Set<string>();
  const activeUsersLastWeek = new Set<string>();

  assignmentsLastTwoWeeks.docs.forEach((assignment) => {
    const assignmentDate = dayjs(assignment.updatedAt || assignment.createdAt);
    const userId = typeof assignment.appUser === "string" ? assignment.appUser : assignment.appUser?.id;

    if (userId) {
      // Consider a user active if they have any assignment activity (including in progress or submitted)
      if (assignmentDate.isSame(dayjs(), "week")) {
        activeUsersThisWeek.add(userId);
      }
      if (assignmentDate.isSame(dayjs().subtract(1, "week"), "week")) {
        activeUsersLastWeek.add(userId);
      }
    }
  });

  const activeCustomersActivity = {
    activeThisWeek: activeUsersThisWeek.size,
    activeLastWeek: activeUsersLastWeek.size,
  };

  // 3. Get total number of customers and detailed customer data
  const allCustomers = await payload.find({
    collection: "appUsers",
    where: {
      role: {
        equals: "customer",
      },
    },
    depth: 1,
    pagination: false,
  });

  const totalCustomers = allCustomers.totalDocs;

  // 4. Fetch all assignments to calculate per-customer statistics
  const allAssignments = await payload.find({
    collection: "assignments",
    depth: 2,
    pagination: false,
  });

  // Create customers array with detailed information
  const customersDetailed = allCustomers.docs.map((customer) => {
    // Find assignments for this customer
    const customerAssignments = allAssignments.docs.filter((assignment) => {
      const assignmentUserId = typeof assignment.appUser === "string" ? assignment.appUser : assignment.appUser?.id;
      return assignmentUserId === customer.id;
    });

    // Count assigned templates (all assignments for this customer)
    const assignedTemplates = customerAssignments.length;

    // Count completed templates (assignments with status "submitted")
    const completedTemplates = customerAssignments.filter((assignment) => assignment.status === "submitted").length;

    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      createdAt: customer.createdAt,
      assignedTemplates,
      completedTemplates,
    };
  });

  return {
    custmersCreationAvctivity,
    activeCustomersActivity,
    assignmentCompletionActivity,
    totalCustomers,
    customersDetailed,
  };
});

export default getAdminCustomersData;
