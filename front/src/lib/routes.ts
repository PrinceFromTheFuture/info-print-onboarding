/**
 * Centralized Router Constants
 * All navigation routes, redirects, and API endpoints should be defined here
 */

export const ROUTES = {
  // Auth Routes
  auth: {
    login: "/auth",
  },

  // Admin Routes
  admin: {
    dashboard: "/admin",
    customers: "/admin/customers",
    templates: "/admin/templates",
    submissions: "/admin/submissions",
    support: "/admin/support",
  },

  // Customer Routes
  customer: {
    root: "/customer",
    workflow: "/customer/workflow",
    forms: "/customer/forms",
    uploads: "/customer/uploads",
    help: "/customer/help",
  },

  // Form/View Routes
  forms: {
    viewForm: (templateId: string, customerId: string) => `/adminFormView/${templateId}/${customerId}`,
    formById: (formId: string) => `/form/${formId}`,
  },

  // API Routes (Backend endpoints)
  api: {
    baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL || "",
    auth: {
      base: "/api/auth",
    },
    media: {
      upload: "/api/media/upload",
      file: (path: string) => `/api/media/file${path}`,
    },
    trpc: {
      base: "/trpc",
    },
  },
} as const;

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = ROUTES.api.baseUrl;
  return `${baseUrl}${endpoint}`;
};

// Navigation items for sidebars and navbars
export const NAV_ITEMS = {
  admin: [
    {
      title: "Dashboard",
      url: ROUTES.admin.dashboard,
      key: "dashboard",
    },
    {
      title: "Customers",
      url: ROUTES.admin.customers,
      key: "customers",
    },
    {
      title: "Templates",
      url: ROUTES.admin.templates,
      key: "templates",
    },
    {
      title: "Submissions",
      url: ROUTES.admin.submissions,
      key: "submissions",
    },
    {
      title: "Support",
      url: ROUTES.admin.support,
      key: "support",
    },
  ],
  customer: [
    {
      title: "Workflow",
      url: ROUTES.customer.workflow,
      key: "workflow",
    },
    {
      title: "Uploads",
      url: ROUTES.customer.uploads,
      key: "uploads",
    },

    {
      title: "Help",
      url: ROUTES.customer.help,
      key: "help",
    },
  ],
} as const;
