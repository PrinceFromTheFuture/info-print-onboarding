"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import type { Question } from "./types";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setFieldValue, updateOrCreateSubmissionAsyncThunk } from "@/lib/redux/formSlice/formSlice";

interface CheckboxInputProps {
  question: Question;
  value?: boolean;
  onChange?: (value: boolean) => void;
  isInvalid?: boolean;
}

export default function CheckboxInput({ question, value = false, onChange }: CheckboxInputProps) {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.form.questionLoadingStates[question.id]);
  const error = useAppSelector((state) => state.form.questionErrors[question.id]);

  const handleChange = (checked: boolean) => {
    onChange?.(checked);

    // Optimistically update and save immediately
    const stringValue = checked ? "true" : "false";
    dispatch(setFieldValue({ questionId: question.id, value: checked }));
    dispatch(updateOrCreateSubmissionAsyncThunk({ questionId: question.id, value: stringValue }));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-3">
        <Checkbox
          id={question.id}
          checked={value}
          onCheckedChange={(checked) => handleChange(checked as boolean)}
          required={question.required || false}
        />
        <Label htmlFor={question.id} className="cursor-pointer text-sm sm:text-base flex items-center gap-2">
          <span>
            {question.label || question.title}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </span>
          {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
        </Label>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
