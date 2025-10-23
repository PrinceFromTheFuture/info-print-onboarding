"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import type { Section } from "./types";

interface FormSidebarProps {
  sections: Section[];
  currentSectionIndex: number;
  onSectionChange: (index: number) => void;
  completedSections?: Set<string>;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function FormSidebar({
  sections,
  currentSectionIndex,
  onSectionChange,
  completedSections = new Set(),
  isOpen = true,
  onClose,
}: FormSidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} aria-hidden="true" />}

      {/* Sidebar - Always visible on desktop (lg), toggleable on mobile */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50",
          "w-80 max-w-[85vw] sm:max-w-80",
          "border-r bg-background flex flex-col",
          "transition-transform duration-300 ease-in-out lg:transition-none",
          "lg:translate-x-0",
          // Mobile only: hide/show based on isOpen
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base sm:text-lg">Form Sections</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">Navigate through the form</p>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden shrink-0 ml-2" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Sections List */}
        <ScrollArea className="flex-1">
          <div className="p-3 sm:p-4 space-y-2">
            {sections.map((section, index) => {
              const isActive = currentSectionIndex === index;
              const isCompleted = completedSections.has(section.id);

              return (
                <button
                  key={section.id}
                  onClick={() => {
                    console.log(`🖱️ Sidebar: Clicked section ${index} - ${section.title}`);
                    onSectionChange(index);
                    onClose?.();
                  }}
                  className={cn(
                    "w-full text-left p-3 sm:p-4 rounded-lg transition-colors",
                    "hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring",
                    isActive && "bg-accent shadow-sm"
                  )}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="shrink-0 mt-0.5">
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                      ) : (
                        <Circle className={cn("h-4 w-4 sm:h-5 sm:w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-xs font-medium", isActive ? "text-primary" : "text-muted-foreground")}>
                          Section {section.order || index + 1}
                        </span>
                      </div>
                      <h4 className={cn("font-medium mt-1 text-sm sm:text-base", isActive ? "text-foreground" : "text-foreground/80")}>
                        {section.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{section.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </aside>
    </>
  );
}
