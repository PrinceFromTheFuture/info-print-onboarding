"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ArrowUpDown, Eye, Download, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Submission } from "./data";

export const columns: ColumnDef<Submission>[] = [
  {
    accessorKey: "customerName",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-0 hover:bg-transparent">
          Customer
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const name = row.getValue("customerName") as string;
      const email = row.original.customerEmail;
      const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{name}</span>
            <span className="text-xs text-muted-foreground">{email}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "templateName",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-0 hover:bg-transparent">
          Template
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("templateName")}</div>;
    },
  },
  {
    accessorKey: "answersCount",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-0 hover:bg-transparent">
          Answers
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{row.getValue("answersCount")}</span>
          <span className="text-xs text-muted-foreground">fields</span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const completionPercentage = row.original.completionPercentage;

      const statusConfig = {
        completed: {
          label: "Completed",
          className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        },
        "in-progress": {
          label: "In Progress",
          className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
        },
        "pending-review": {
          label: "Not Yet Started",
          className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        },
      };

      const config = statusConfig[status as keyof typeof statusConfig] || {
        label: "Unknown",
        className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      };

      return (
        <div className="flex flex-col gap-2 min-w-[140px]">
          <Badge variant="secondary" className={config.className}>
            {config.label}
          </Badge>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "submittedAt",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-0 hover:bg-transparent">
          Submitted
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("submittedAt"));
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

      let timeAgo = "";
      if (diffInHours < 1) {
        timeAgo = "Just now";
      } else if (diffInHours < 24) {
        timeAgo = `${diffInHours}h ago`;
      } else if (diffInHours < 48) {
        timeAgo = "Yesterday";
      } else {
        const days = Math.floor(diffInHours / 24);
        timeAgo = `${days}d ago`;
      }

      return (
        <div className="flex flex-col">
          <span className="text-sm">{timeAgo}</span>
          <span className="text-xs text-muted-foreground">{date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const submission = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(submission.id)}>Copy submission ID</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a
                href={ROUTES.forms.viewForm(submission.templateId, submission.customerId)}
                target="_blank"
                rel="noopener noreferrer"
                className="gap-2 flex cursor-default"
              >
                <Eye className="h-4 w-4" />
                View Details
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <Download className="h-4 w-4" />
              Export Answers
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-red-600">
              <Trash2 className="h-4 w-4" />
              Delete Submission
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
