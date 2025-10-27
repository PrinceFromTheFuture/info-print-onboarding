"use client";

import React, { useEffect, use, useState } from "react";
import { ChevronLeft, ChevronRight, Menu, AlertCircle, Loader2, ArrowLeft, Eye, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";

import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import Link from "next/link";
import {
  getFilledTemplateByIdAsyncThunk,
  setCurrentSectionIndex,
  nextSection,
  previousSection,
  setFieldValue,
  markSectionComplete,
  toggleSidebar,
} from "@/lib/redux/formSlice/formSlice";
import { Section } from "@/app/(private)/form/[formId]/_components/types";
import { getIncompleteQuestions, isSectionComplete } from "@/app/(private)/form/[formId]/_components/validation";
import { Button } from "@/components/ui/button";
import FormSidebar from "@/app/(private)/form/[formId]/_components/FormSidebar";
import FormSection from "@/app/(private)/form/[formId]/_components/FormSection";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/trpc";

export default function FormPage({ params }: { params: Promise<{ formId: string; userId: string }> }) {
  const unwrappedParams = use(params);
  const dispatch = useAppDispatch();

  // Get state from Redux
  const {
    form: template,
    isLoading,
    error,
    currentSectionIndex,
    formData,
    completedSections,
    sidebarOpen,
    questionLoadingStates,
  } = useAppSelector((state) => state.form);

  // Check if any question is currently syncing
  const isSyncing = Object.values(questionLoadingStates).some((loading) => loading);

  // Track which questions should be highlighted as invalid
  const [invalidQuestions, setInvalidQuestions] = useState<Set<string>>(new Set());

  // Fetch form data on mount
  useEffect(() => {
    if (unwrappedParams.formId) {
      dispatch(getFilledTemplateByIdAsyncThunk({ formId: unwrappedParams.formId, userId: unwrappedParams.userId }));
    }
  }, [unwrappedParams.formId, dispatch]);

  // Filter and sort sections
  const sections: Section[] = (template?.sections || [])
    .filter((s: unknown): s is Section => typeof s !== "string" && s !== null && typeof s === "object")
    .map((s: Section) => s as Section)
    .sort((a: Section, b: Section) => (a.order || 0) - (b.order || 0));

  const currentSection = sections[currentSectionIndex];
  const isFirstSection = currentSectionIndex === 0;
  const isLastSection = currentSectionIndex === sections.length - 1;

  //
  // Validation state
  const currentSectionComplete = currentSection ? isSectionComplete(currentSection, formData) : false;

  const handleFieldChange = (questionId: string, value: any) => {
    dispatch(setFieldValue({ questionId, value }));
  };

  const handleNext = () => {
    if (!currentSection) return;

    if (!currentSectionComplete) {
      const incompleteQuestions = getIncompleteQuestions(currentSection, formData);
      const questionLabels = incompleteQuestions.map((q) => q.label || q.title).join(", ");

      // Highlight invalid questions
      const invalidIds = new Set(incompleteQuestions.map((q) => q.id));
      setInvalidQuestions(invalidIds);

      toast.error("Incomplete Section", {
        description: `Please complete all required fields: ${questionLabels}`,
        duration: 4000,
      });
      return;
    }

    // Clear invalid questions when moving forward
    setInvalidQuestions(new Set());

    // Mark current section as completed
    dispatch(markSectionComplete(currentSection.id));

    if (!isLastSection) {
      dispatch(nextSection());
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    if (!isFirstSection) {
      dispatch(previousSection());
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSectionChange = (index: number) => {
    // Clear invalid questions when changing sections
    setInvalidQuestions(new Set());
    dispatch(setCurrentSectionIndex(index));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading form...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-6 max-w-md">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Failed to Load Form</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => dispatch(getFilledTemplateByIdAsyncThunk({ formId: unwrappedParams.formId, userId: unwrappedParams.userId }))}>
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // No sections available
  if (!currentSection) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">No sections available</p>
      </div>
    );
  }

  // Convert completedSections array to Set for compatibility
  const completedSectionsSet = new Set(completedSections);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Hidden on mobile by default, always visible on desktop */}
      <FormSidebar
        sections={sections}
        currentSectionIndex={currentSectionIndex}
        onSectionChange={handleSectionChange}
        completedSections={completedSectionsSet}
        isOpen={sidebarOpen}
        onClose={() => dispatch(toggleSidebar(false))}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="">
          {/* Mobile Menu Button */}
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden fixed bottom-4 left-4 z-30 h-12 w-12 rounded-full shadow-lg"
            onClick={() => dispatch(toggleSidebar(true))}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Admin View Banner */}
          <div className="bg-linear-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 px-4 py-3 mb-4 mx-8 mt-6 rounded-r-lg">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-amber-600" />
                <Lock className="h-4 w-4 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 text-sm sm:text-base">Admin View - Read Only Mode</h3>
                <p className="text-xs sm:text-sm text-amber-700 mt-0.5">
                  You are viewing this form submission in read-only mode. All inputs are disabled for data integrity.
                </p>
              </div>
            </div>
          </div>

          {/* Sticky Header with Title, Progress, and Sync Indicator */}
          <div className="sticky bg-white shadow-lg rounded-b-2xl lg:rounded-b-none w-full top-0 z-20  ">
            {/* Back Link - Above Sticky Header */}
            <Button variant="outline" className="mb-4 mx-8 mt-6">
              <Link href="/admin" className="inline-flex items-center gap-2 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            {/* Syncing Banner */}
            {isSyncing && (
              <div className="bg-linear-to-r  from-blue-500/10 via-blue-500/5 to-transparent border-l-4 border-blue-500 px-4 py-2.5 sm:py-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-blue-600 dark:text-blue-400" />
                    <div className="absolute inset-0 animate-ping">
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600/40 dark:text-blue-400/40" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm sm:text-base font-medium text-blue-900 dark:text-blue-100">Syncing your changes...</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 hidden sm:block">Your form data is being saved automatically</p>
                  </div>
                </div>
              </div>
            )}

            {/* Header Content */}
            <div className="lg:py-8 lg:px-20 pt-0 py-6 px-6">
              <div className="flex flex-col gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold line-clamp-1">{template?.name || "Form"}</h1>
                  <p className="text-muted-foreground text-xs sm:text-sm line-clamp-1 mt-1">{template?.description}</p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-medium text-muted-foreground">
                      Section {currentSection.order || currentSectionIndex + 1} of {sections.length}
                    </span>
                    <span className="text-muted-foreground">{Math.round(((currentSectionIndex + 1) / sections.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5 sm:h-2">
                    <div
                      className="bg-primary h-1.5 sm:h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${((currentSectionIndex + 1) / sections.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section with Admin Overlay */}
          <div className="max-w-4xl mx-auto py-4 px-4 sm:py-6 sm:px-6 lg:py-8 relative">
            {/* Admin Overlay to disable all inputs */}
            <div className="absolute inset-0 z-10 pointer-events-none" style={{ pointerEvents: "none" }}>
              {/* Visual indicator overlay */}
              <div className="absolute inset-0 bg-amber-50/30 border-2 border-dashed border-amber-300 rounded-lg opacity-50"></div>
            </div>

            {/* Form content with disabled pointer events */}
            <div className="relative" style={{ pointerEvents: "none" }}>
              <FormSection
                section={currentSection as Section}
                formData={formData}
                onFieldChange={handleFieldChange}
                invalidQuestions={invalidQuestions}
              />
            </div>
          </div>

          {/* Validation Warning */}
          {!currentSectionComplete && (
            <Card className="mt-6 p-4 border-amber-500/50 bg-amber-500/10">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-amber-900 dark:text-amber-100 text-sm sm:text-base">Required Fields Missing</h4>
                  <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-200 mt-1">
                    Please complete all required fields (marked with *) before proceeding to the next section.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Navigation Buttons - Disabled in Admin View */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 sm:mt-8 pt-6 border-t mx-auto max-w-4xl w-full pb-12 relative">
            {/* Admin overlay for navigation */}
            <div className="absolute inset-0 z-10 pointer-events-none" style={{ pointerEvents: "none" }}>
              <div className="absolute inset-0 bg-amber-50/20 rounded-lg"></div>
            </div>

            <Button variant="outline" onClick={handlePrevious} disabled={true} className="gap-2 w-full sm:w-auto order-2 sm:order-1 opacity-50">
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="text-xs sm:text-sm text-muted-foreground text-center order-1 sm:order-2">
              <div className="flex items-center gap-2">
                <Lock className="h-3 w-3" />
                {completedSections.length} of {sections.length} sections completed (Read Only)
              </div>
            </div>

            {isLastSection ? (
              <></>
            ) : (
              <Button onClick={handleNext} disabled={true} className="gap-2 w-full sm:w-auto order-3 opacity-50">
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
