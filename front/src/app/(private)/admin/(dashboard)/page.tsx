"use client";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users, FileText, CheckCircle2, TrendingUp, Activity, UserPlus, Clock, Plus, ChevronDown, ChevronRight } from "lucide-react";
import { useTRPC } from "@/trpc/trpc";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

export default function Page() {
  const trpc = useTRPC();
  const { data, isLoading, error } = useQuery(trpc.adminDataRouter.getAdminDashboardData.queryOptions());
  const { data: visitsData } = useQuery(trpc.getVisitsData.queryOptions());

  // Calculate stats from real data
  const submissionsToday = data?.SubmitionsCreationAvctivity.createAtToday || 0;
  const submissionsYesterday = data?.SubmitionsCreationAvctivity.createAtYesterday || 0;
  const submissionsChange =
    submissionsYesterday > 0
      ? `+${(((submissionsToday - submissionsYesterday) / submissionsYesterday) * 100).toFixed(1)}%`
      : submissionsToday > 0
        ? "+100%"
        : "0%";

  const newCustomersToday = data?.custmersCreationAvctivity.createAtToday || 0;
  const newCustomersYesterday = data?.custmersCreationAvctivity.createAtYesterday || 0;
  const customersChange =
    newCustomersYesterday > 0
      ? `+${(((newCustomersToday - newCustomersYesterday) / newCustomersYesterday) * 100).toFixed(1)}%`
      : newCustomersToday > 0
        ? "+100%"
        : "0%";

  const activeTemplates = data?.tempaltesCreationAvctivity || 0;

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-12 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-12 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-destructive">Error loading dashboard data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-12 p-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your platform today.</p>
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
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-medium">Submissions Today</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissionsToday}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 font-medium">{submissionsChange}</span> from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-medium">New Customers</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newCustomersToday}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 font-medium">{customersChange}</span> from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-medium">Active Templates</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTemplates}</div>
            <p className="text-xs text-muted-foreground">Total templates in system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-medium">Recent Activity</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.recentSubmittedAssignmentsAvctivity.length || 0}</div>
            <p className="text-xs text-muted-foreground">Recent submissions</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="col-span-4 bg-card border ">
        <CardHeader>
          <CardTitle>Visit Trends</CardTitle>
          <CardDescription>Daily visit activity by device type</CardDescription>
        </CardHeader>
        <CardContent className="pl-2 px-8">
          <ChartAreaInteractive visitsData={visitsData} />
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Recent Customers */}
        <Card className="col-span-1 ">
          <CardHeader>
            <CardTitle>Recent Customer Onboarding</CardTitle>
            <CardDescription>New customers added to the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 px-2">
              {data?.last5UsersCreatedAvctivity.map((customer, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {customer.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{customer.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {customer.assignments} assignments
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button size="sm">
              <Link href={ROUTES.admin.customers}>View All Customers</Link>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        {/* Recent Submissions */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
            <CardDescription>Latest form submissions from customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 px-2">
              {data?.recentSubmittedAssignmentsAvctivity.map((submission, index) => (
                <div key={index} className="flex items-start justify-between border-b last:border-0 pb-4 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{submission.customerName}</p>
                    <p className="text-sm text-muted-foreground">{submission.templateName}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="default" className="text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        completed
                      </Badge>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(submission.submitedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
