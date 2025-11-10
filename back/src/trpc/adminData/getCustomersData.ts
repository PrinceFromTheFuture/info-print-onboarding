import { getPayload } from "../../db/getPayload.js";
import { privateProcedure } from "../trpc.js";
import { z } from "zod";
import type { AppUser } from "../../payload-types.js";

export const getCustomersData = privateProcedure
  .input(
    z
      .object({
        search: z.string().optional(),
      })
      .optional()
  )
  .query(async ({ ctx, input }) => {
    const payload = await getPayload;

    // Build where clause for search
    const whereClause: any = {
      role: {
        equals: "customer",
      },
    };

    // Fetch all customers without pagination or sorting
    const customers = await payload.find({
      collection: "appUsers",
      where: {
        role: {
          equals: "customer",
        },
      },

      depth: 1,
      pagination: false,
    });
    // Get assignments for each customer to calculate progress
    const customerIds = customers.docs.map((customer) => customer.id);

    const assignments = await payload.find({
      collection: "assignments",
      where: {
        appUser: {
          in: customerIds,
        },
      },
      depth: 1,
      pagination: false,
    });

    // Calculate progress for each customer
    const customerProgressMap = new Map<string, { total: number; completed: number; progress: number }>();

    assignments.docs.forEach((assignment) => {
      const customerId = typeof assignment.appUser === "string" ? assignment.appUser : assignment.appUser?.id;

      if (customerId) {
        const current = customerProgressMap.get(customerId) || { total: 0, completed: 0, progress: 0 };
        current.total += 1;
        if (assignment.status === "submitted") {
          current.completed += 1;
        }
        customerProgressMap.set(customerId, current);
      }
    });

    // Calculate progress percentages
    customerProgressMap.forEach((progress, customerId) => {
      progress.progress = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;
    });

    // Transform customers data with progress
    const customersWithProgress = customers.docs.map((customer) => {
      const progress = customerProgressMap.get(customer.id) || { total: 0, completed: 0, progress: 0 };

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        role: customer.role,
        createdAt: customer.createdAt,
        onboardingProgress: progress.progress,
        assignedTemplates: progress.total,
        completedTemplates: progress.completed,
        isApproved: customer.isApproved ?? false,
      };
    });

    return {
      customers: customersWithProgress,
    };
  });

export default getCustomersData;
