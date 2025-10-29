"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Copy, Archive, Trash2, Users, FileText, Calendar, BarChart3 } from "lucide-react";
import Link from "next/link";
interface Template {
  id: string;
  sections: number;
  lastUpdates: string;
  assignedAndSubmitted: number;
  assigned: number;
  name: string;
  description?: string | null;
}

interface TemplateCardProps {
  template: Template;
  onAction?: (action: string, template: Template) => void;
}

export function TemplateCard({ template, onAction }: TemplateCardProps) {
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) return `${diffInHours}h ago`;
    const days = Math.floor(diffInHours / 24);
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-200 hover:border-primary/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg flex-max-w-full  text-wrap">{template.name}</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription className="line-clamp-2 text-sm min-h-[40px]">{template.description || "No description available"}</CardDescription>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{template.sections}</span>
              <span className="text-xs text-muted-foreground">Sections</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{template.assigned}</span>
              <span className="text-xs text-muted-foreground">Assigned</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{template.assignedAndSubmitted}</span>
              <span className="text-xs text-muted-foreground">Submitted</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{getRelativeTime(template.lastUpdates)}</span>
              <span className="text-xs text-muted-foreground">Updated</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Link href={`/form/${template.id}`} target="_blank" className="flex-1 cursor-pointer">
            <Button variant="outline" size="sm" className="w-full cursor-pointer">
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
          </Link>
          <Button variant="default" size="sm" className="flex-1" onClick={() => onAction?.("edit", template)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
