"use client";

import React, { useEffect } from "react";
import QuestionRenderer from "./QuestionRenderer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Section, Group, Question, isGroup, isQuestion } from "./types";

interface FormSectionProps {
  section: Section;
  formData: Record<string, string | boolean | null | undefined>;
  onFieldChange: (questionId: string, value: any) => void;
  invalidQuestions?: Set<string>;
}

const ConditionalRendererGroupsFilter = (groups: Group[], formData: Record<string, string | boolean | null | undefined>) => {
  const filteredGroups = groups.filter((group) => {
    if (Object.keys(group.showIf || {}).length === 0) return true;

    const questionId = (group.showIf?.question as Question).id;
    const questionValue = formData[questionId];
    const condition = group.showIf?.condition;
    const value = group.showIf?.value;
    if (condition == "equals") {
      if (String(questionValue) == String(value)) return true;
    } else if (condition == "not equals") {
      if (String(questionValue) != String(value)) return true;
    }
    return false;
  });
  return filteredGroups;
};

export default function FormSection({ section, formData, onFieldChange, invalidQuestions = new Set() }: FormSectionProps) {
  // Filter and sort groups
  const groups = (section.groups || []).filter((g): g is Group => typeof g !== "string").sort((a, b) => (a.order || 0) - (b.order || 0));

  const filteredGroups = ConditionalRendererGroupsFilter(groups, formData);

  console.log(formData);
  console.log(groups);
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{section.title}</h2>
        <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">{section.description}</p>
      </div>
      <Separator />

      {filteredGroups.map((group) => {
        // Filter and sort questions
        const questions = (group.questions || []).filter((q): q is Question => typeof q !== "string").sort((a, b) => (a.order || 0) - (b.order || 0));

        if (questions.length === 0) return null;

        // Check if any question in this group is invalid
        const hasInvalidQuestion = questions.some((q) => invalidQuestions.has(q.id));

        return (
          <Card
            key={group.id}
            className={cn(
              "bg-card border shadow-none transition-all duration-200",
              hasInvalidQuestion && "border-2 border-red-500 bg-red-50/50 dark:bg-red-950/20"
            )}
          >
            {group.title && (
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-lg sm:text-xl">{group.title}</CardTitle>
              </CardHeader>
            )}
            <CardContent className={group.title ? "pt-0" : "pt-4 sm:pt-6"}>
              <div className="space-y-4 sm:space-y-6">
                {questions.map((question, index) => (
                  <div key={question.id}>
                    <QuestionRenderer
                      question={question}
                      value={formData[question.id]}
                      onChange={(value) => onFieldChange(question.id, value)}
                      isInvalid={invalidQuestions.has(question.id)}
                    />
                    {index < questions.length - 1 && <Separator className="mt-4 sm:mt-6" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
