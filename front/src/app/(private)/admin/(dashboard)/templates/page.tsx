"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TemplateCard } from "./_components/template-card";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/trpc";

export default function TemplatesPage() {
  const trpc = useTRPC();
  const { data: templates, isLoading, error } = useQuery(trpc.templatesRouter.getTemplatesStats.queryOptions());

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  console.log(templates);
  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      {/* Compact Header with Inline Stats */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
            <p className="text-muted-foreground mt-1">Create and manage form templates for customer onboarding</p>
          </div>
        </div>

        <Button className="gap-2" size="lg">
          <Plus className="h-5 w-5" />
          Create Template
        </Button>
      </div>

      {/* Control Bar */}
      <Card className="bg-transparent px-0">
        <CardContent className="px-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates by name or description..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Button variant={showFilters ? "default" : "outline"} size="sm" className="gap-2" onClick={() => setShowFilters(!showFilters)}>
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {statusFilter && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                    1
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          // Loading skeleton cards
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="group hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header skeleton */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>

                  {/* Description skeleton */}
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />

                  {/* Stats grid skeleton */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <div className="flex flex-col gap-1">
                          <Skeleton className="h-4 w-8" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Buttons skeleton */}
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-9 flex-1" />
                    <Skeleton className="h-9 flex-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : error ? (
          // Error state
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-destructive mb-2">Failed to load templates</h3>
              <p className="text-muted-foreground mb-4">{error instanceof Error ? error.message : "An unexpected error occurred"}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Try again
              </Button>
            </div>
          </div>
        ) : templates && templates.length > 0 ? (
          // Success state - render templates
          templates.map((template) => <TemplateCard key={template.id} template={template} />)
        ) : (
          // Empty state
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">No templates found</h3>
              <p className="text-muted-foreground mb-4">Get started by creating your first template</p>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Template
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
