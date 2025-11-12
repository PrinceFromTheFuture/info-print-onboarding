"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Circle, Clock, PlayCircle, ArrowRight, Loader2, ListTodo } from "lucide-react";
import Link from "next/link";
import { useTRPC } from "@/trpc/trpc";
import { useMemo } from "react";

export const dynamic = "force-dynamic";

export default function WorkflowPage() {
  const trpc = useTRPC();
  const { data: assignedTemplates, isLoading } = useQuery(trpc.customerRouter.getUserAssignedTemplates.queryOptions());

  // Separate templates by status
  const { activeTemplates, completedTemplates } = useMemo(() => {
    if (!assignedTemplates) {
      return { activeTemplates: [], completedTemplates: [] };
    }

    const active = assignedTemplates.filter((t) => t.status === "pending" || t.status === "inProgress");
    const completed = assignedTemplates.filter((t) => t.status === "submitted");

    return { activeTemplates: active, completedTemplates: completed };
  }, [assignedTemplates]);

  const getStatusConfig = (status: string) => {
    const configs = {
      inProgress: {
        label: "In Progress",
        icon: Clock,
        className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      },
      pending: {
        label: "Not Started",
        icon: Circle,
        className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      },
      submitted: {
        label: "Completed",
        icon: CheckCircle2,
        className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      },
    };
    return configs[status as keyof typeof configs];
  };

  const renderTemplateCard = (assignment: any) => {
    const statusConfig = getStatusConfig(assignment.status);
    const StatusIcon = statusConfig.icon;

    return (
      <Card key={assignment.assignmentId} className="group hover:shadow-md transition-all duration-200 hover:border-primary/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <StatusIcon className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-lg text-wrap">{assignment.templateName}</CardTitle>
                </div>
                <Badge variant="secondary" className={`${statusConfig.className} text-xs`}>
                  {statusConfig.label}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardDescription className="line-clamp-2 text-sm min-h-[40px]">
            {assignment.templateDescription || "No description available"}
          </CardDescription>

          {/* Progress Bar for in-progress items */}
          {assignment.status === "inProgress" && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{assignment.progress.percentage}%</span>
              </div>
              <Progress value={assignment.progress.percentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {assignment.progress.completed} of {assignment.progress.total} questions completed
              </p>
            </div>
          )}

          {/* Show total questions for pending status */}
          {assignment.status === "pending" && <p className="text-xs text-muted-foreground">{assignment.progress.total} questions to complete</p>}

          {/* Show completion info for submitted status */}
          {assignment.status === "submitted" && (
            <p className="text-xs text-green-600 dark:text-green-400">All {assignment.progress.total} questions completed</p>
          )}

          <Link href={`/form/${assignment.templateId}`} className="w-full flex-1" target="_blank">
            {assignment.status === "pending" && (
              <Button variant="default" size="sm" className="w-full">
                <PlayCircle className="h-4 w-4 mr-2" />
                Start
              </Button>
            )}
            {assignment.status === "inProgress" && (
              <Button variant="default" size="sm" className="w-full">
                <ArrowRight className="h-4 w-4 mr-2" />
                Continue
              </Button>
            )}
            {assignment.status === "submitted" && (
              <Button variant="outline" size="sm" className="w-full" disabled>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Completed
              </Button>
            )}
          </Link>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Forms</h1>
        <p className="text-muted-foreground mt-1">Complete your assigned templates</p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (!assignedTemplates || assignedTemplates.length === 0) && (
        <Card className="py-12">
          <CardContent className="text-center">
            <Circle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No workflows assigned</h3>
            <p className="text-muted-foreground">You don't have any templates assigned yet.</p>
          </CardContent>
        </Card>
      )}

      {/* Tabbed Template Cards */}
      {!isLoading && assignedTemplates && assignedTemplates.length > 0 && (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-auto p-1 bg-muted/50 rounded-lg">
            <TabsTrigger
              value="active"
              className="flex items-center gap-2 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all"
            >
              <ListTodo className="h-4 w-4" />
              <span className="font-medium">Active</span>
              <Badge
                variant="secondary"
                className="ml-1 h-5 min-w-5 flex items-center justify-center bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
              >
                {activeTemplates.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="flex items-center gap-2 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-medium">Completed</span>
              <Badge
                variant="secondary"
                className="ml-1 h-5 min-w-5 flex items-center justify-center bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              >
                {completedTemplates.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Active Templates Tab */}
          <TabsContent value="active" className="mt-6 space-y-4">
            {activeTemplates.length === 0 ? (
              <Card className="py-12">
                <CardContent className="text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                  <p className="text-muted-foreground">You have no active workflows at the moment.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{activeTemplates.map(renderTemplateCard)}</div>
            )}
          </TabsContent>

          {/* Completed Templates Tab */}
          <TabsContent value="completed" className="mt-6 space-y-4">
            {completedTemplates.length === 0 ? (
              <Card className="py-12">
                <CardContent className="text-center">
                  <ListTodo className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No completed workflows yet</h3>
                  <p className="text-muted-foreground">Complete your active workflows to see them here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{completedTemplates.map(renderTemplateCard)}</div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
