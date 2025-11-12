"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, ChevronDown, UserPlus, FileText, Users } from "lucide-react";
import { CustomerStats } from "./_components/customer-stats";
import { CustomersDataTable } from "./_components/customers-data-table";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/trpc";
import { CustomerDetailDialog } from "@/components/customer-detail-dialog";
import EditCustomer from "./_components/edit-customer";

export default function CustomersPage() {
  const trpc = useTRPC();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "email" | "createdAt" | "onboardingProgress">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [editCustomerOpen, setEditCustomerOpen] = useState(false);
  const { data: availableTemplates } = useQuery(trpc.templatesRouter.getTemplates.queryOptions());
  const { data: customersDataResponse, isLoading: customersLoading } = useQuery(trpc.adminDataRouter.getCustomersData.queryOptions());

  const { data: adminCustomersData, isLoading: adminDataLoading } = useQuery(trpc.adminDataRouter.getAdminCustomersData.queryOptions());

  // Get customers data from TRPC response
  // @ts-ignore
  const customersData = customersDataResponse?.customers || [];

  // Filter customers based on search (client-side filtering for now)
  const filteredCustomers = customersData;

  // Sort the filtered customers
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    let aValue: any, bValue: any;

    switch (sortBy) {
      case "name":
        aValue = a.name;
        bValue = b.name;
        break;
      case "email":
        aValue = a.email;
        bValue = b.email;
        break;
      case "createdAt":
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      case "onboardingProgress":
        aValue = a.onboardingProgress;
        bValue = b.onboardingProgress;
        break;
      default:
        aValue = a.name;
        bValue = b.name;
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Transform customers data to ensure role is always a string
  const transformedCustomers = sortedCustomers.map((customer) => ({
    ...customer,
    role: customer.role || "customer",
  }));

  // Paginate the sorted customers
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedCustomers = transformedCustomers.slice(startIndex, endIndex);

  const totalPages = Math.ceil(filteredCustomers.length / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  // Transform admin data to stats format
  const statsData = adminCustomersData
    ? {
        totalCustomers: adminCustomersData.totalCustomers,
        customersChange:
          adminCustomersData.custmersCreationAvctivity.createAtToday > 0
            ? `+${adminCustomersData.custmersCreationAvctivity.createAtToday}`
            : "No new customers",
        activeCustomers: adminCustomersData.activeCustomersActivity.activeThisWeek,
        activeChange:
          adminCustomersData.activeCustomersActivity.activeThisWeek - adminCustomersData.activeCustomersActivity.activeLastWeek > 0
            ? `+${adminCustomersData.activeCustomersActivity.activeThisWeek - adminCustomersData.activeCustomersActivity.activeLastWeek}`
            : adminCustomersData.activeCustomersActivity.activeThisWeek - adminCustomersData.activeCustomersActivity.activeLastWeek < 0
              ? `${adminCustomersData.activeCustomersActivity.activeThisWeek - adminCustomersData.activeCustomersActivity.activeLastWeek}`
              : "No change",
        avgCompletion: Math.round(adminCustomersData.assignmentCompletionActivity.completionRateThisWeek),
        completionChange:
          Math.round(
            adminCustomersData.assignmentCompletionActivity.completionRateThisWeek -
              adminCustomersData.assignmentCompletionActivity.completionRateLastWeek
          ) > 0
            ? `+${Math.round(adminCustomersData.assignmentCompletionActivity.completionRateThisWeek - adminCustomersData.assignmentCompletionActivity.completionRateLastWeek)}%`
            : Math.round(
                  adminCustomersData.assignmentCompletionActivity.completionRateThisWeek -
                    adminCustomersData.assignmentCompletionActivity.completionRateLastWeek
                ) < 0
              ? `${Math.round(adminCustomersData.assignmentCompletionActivity.completionRateThisWeek - adminCustomersData.assignmentCompletionActivity.completionRateLastWeek)}%`
              : "No change",
        newThisWeek: adminCustomersData.custmersCreationAvctivity.createAtToday + adminCustomersData.custmersCreationAvctivity.createAtYesterday,
        newChange:
          adminCustomersData.custmersCreationAvctivity.createAtToday > 0
            ? `+${adminCustomersData.custmersCreationAvctivity.createAtToday} today`
            : adminCustomersData.custmersCreationAvctivity.createAtYesterday > 0
              ? `${adminCustomersData.custmersCreationAvctivity.createAtYesterday} yesterday`
              : "No new customers",
      }
    : {
        totalCustomers: 0,
        customersChange: "No data",
        activeCustomers: 0,
        activeChange: "No data",
        avgCompletion: 0,
        completionChange: "No data",
        newThisWeek: 0,
        newChange: "No data",
      };

  const customersTableData = {
    customers: paginatedCustomers,
    pagination: {
      page,
      limit,
      totalPages,
      totalDocs: filteredCustomers.length,
      hasNextPage,
      hasPrevPage,
    },
  };
  const isLoading = customersLoading || adminDataLoading;

  return (
    <div className="flex flex-1 flex-col gap-8 p-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage customer onboarding and track progress across all templates</p>
        </div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="hidden ">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create New
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Create New</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem className="gap-2 cursor-pointer">
                <FileText className="h-4 w-4" />
                <span>Template</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* Stats Grid */}
      <CustomerStats stats={statsData} />

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Customers</CardTitle>
              <CardDescription className="mt-1.5">View and manage all customer accounts and their onboarding progress</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CustomersDataTable
            onEditCustomer={(customerId) => setEditCustomerOpen(true)}
            data={customersTableData.customers}
            pagination={customersTableData.pagination}
            onPageChange={(newPage) => setPage(newPage)}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1); // Reset to first page when changing limit
            }}
            onSearchChange={setSearch}
            onSortChange={(newSortBy, newSortOrder) => {
              setSortBy(newSortBy as any);
              setSortOrder(newSortOrder);
              setPage(1); // Reset to first page when changing sort
            }}
            onRowClick={setSelectedCustomer}
            loading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Customer Detail Dialog */}
      <CustomerDetailDialog
        customerId={selectedCustomer?.id}
        open={!!selectedCustomer && !editCustomerOpen}
        onOpenChange={(open) => !open && setSelectedCustomer(null)}
        availableTemplates={availableTemplates}
      />
      <EditCustomer customerId={selectedCustomer?.id} open={editCustomerOpen} onOpenChange={(open) => setEditCustomerOpen(open)} />
    </div>
  );
}
