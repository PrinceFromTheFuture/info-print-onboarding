"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, Filter, TrendingUp, TrendingDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SubmissionsTable } from "./_components/submissions-table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/trpc";

// Map backend status to frontend status
const mapStatus = (backendStatus: string): "completed" | "in-progress" | "pending-review" => {
  switch (backendStatus) {
    case "submitted":
      return "completed";
    case "inProgress":
      return "in-progress";
    case "pending":
      return "pending-review";
    default:
      return "in-progress"; // Default fallback
  }
};

export default function SubmissionsPage() {
  const trpc = useTRPC();
  const { data, isLoading, error } = useQuery(trpc.adminDataRouter.getAdminSubmissions.queryOptions());
  const [searchQuery, setSearchQuery] = useState("");

  // Transform backend data to match the table structure
  const submissionsData = useMemo(() => {
    if (!data?.assignedTemplates) return [];

    return data.assignedTemplates.map((assignment) => ({
      id: assignment.assignmentId,
      customerId: assignment.userId,
      customerName: assignment.userName,
      customerEmail: assignment.userEmail,
      templateId: assignment.templateId, // Using assignment ID as template ID
      templateName: assignment.templateName,
      answersCount: assignment.submissionCount,
      status: mapStatus(assignment.status || "inProgress"),
      submittedAt: assignment.lastUpdatedSubmission || assignment.assignmentUpdatedAt,
      lastUpdated: assignment.lastUpdatedSubmission || assignment.assignmentUpdatedAt,
      completionPercentage: 100, // This would need to be calculated based on total questions vs answered
    }));
  }, [data]);

  // Calculate stats from real data
  const statsData = useMemo(() => {
    if (!data) {
      return {
        totalSubmissions: 0,
        completedSubmissions: 0,
        inProgressSubmissions: 0,
        pendingReviewSubmissions: 0,
        submissionsChange: 0,
        avgCompletionTime: 0,
        completionRate: 0,
      };
    }

    const completedCount = submissionsData.filter((s) => s.status === "completed").length;
    const inProgressCount = submissionsData.filter((s) => s.status === "in-progress").length;
    const pendingReviewCount = submissionsData.filter((s) => s.status === "pending-review").length;

    return {
      totalSubmissions: data.totalSubmissionsData.total,
      completedSubmissions: completedCount,
      inProgressSubmissions: inProgressCount,
      pendingReviewSubmissions: pendingReviewCount,
      submissionsChange: data.totalSubmissionsData.percentageChange,
      avgCompletionTime: 0, // Backend doesn't provide this yet
      completionRate: data.completionRateData.completionRate,
    };
  }, [data, submissionsData]);

  // Filter submissions based on search
  const filteredSubmissions = useMemo(() => {
    return submissionsData.filter(
      (submission) =>
        submission.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        submission.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        submission.templateName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [submissionsData, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-8 p-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">Loading submissions data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-8 p-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-destructive">Error loading submissions data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-8 p-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Submissions</h1>
          <p className="text-muted-foreground">Track and analyze all template submissions from customers</p>
        </div>

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Completed</DropdownMenuItem>
              <DropdownMenuItem>In Progress</DropdownMenuItem>
              <DropdownMenuItem>Pending Review</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Filter by Template</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Employee Onboarding</DropdownMenuItem>
              <DropdownMenuItem>Client Information</DropdownMenuItem>
              <DropdownMenuItem>Project Intake</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Statistics - Horizontal Layout */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Stat Card - Larger */}
        <Card className="md:col-span-2 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Total Submissions</CardTitle>
            <CardDescription>Overview of all submission activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-5xl font-bold">{statsData.totalSubmissions}</div>
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="secondary" className="gap-1 text-xs">
                    {statsData.submissionsChange > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className={statsData.submissionsChange > 0 ? "text-green-600" : "text-red-600"}>
                      {Math.abs(statsData.submissionsChange)}%
                    </span>
                  </Badge>
                  <span className="text-sm text-muted-foreground">vs last month</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col items-end">
                  <div className="text-2xl font-bold text-green-600">{statsData.completedSubmissions}</div>
                  <div className="text-xs text-muted-foreground mt-1">Completed</div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-2xl font-bold text-orange-600">{statsData.inProgressSubmissions}</div>
                  <div className="text-xs text-muted-foreground mt-1">In Progress</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Secondary Stats */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Completion Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{statsData.avgCompletionTime > 0 ? statsData.avgCompletionTime : "N/A"}</div>
              <p className="text-xs text-muted-foreground mt-1">{statsData.avgCompletionTime > 0 ? "hours per submission" : "Not yet calculated"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{statsData.completionRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">of started submissions</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Submissions</CardTitle>
              <CardDescription className="mt-1.5">View and manage all template submissions from customers</CardDescription>
            </div>
            <div className="relative w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer or template..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <SubmissionsTable data={filteredSubmissions} />
        </CardContent>
      </Card>
    </div>
  );
}
