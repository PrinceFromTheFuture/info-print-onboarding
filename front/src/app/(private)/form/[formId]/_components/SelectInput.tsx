"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { Question } from "./types";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setFieldValue, updateOrCreateSubmissionAsyncThunk } from "@/lib/redux/formSlice/formSlice";

interface SelectInputProps {
  question: Question;
  value?: string;
  onChange?: (value: string) => void;
  isInvalid?: boolean;
}

export default function SelectInput({ question, value, onChange }: SelectInputProps) {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.form.questionLoadingStates[question.id]);
  const error = useAppSelector((state) => state.form.questionErrors[question.id]);

  const handleChange = (newValue: string) => {
    onChange?.(newValue);

    // Optimistically update and save immediately
    dispatch(setFieldValue({ questionId: question.id, value: newValue }));
    dispatch(updateOrCreateSubmissionAsyncThunk({ questionId: question.id, value: newValue }));
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={question.id} className="text-sm sm:text-base flex items-center gap-2">
        <span>
          {question.label || question.title}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </span>
        {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
      </Label>
      <Select value={value} onValueChange={handleChange}>
        <SelectTrigger className="w-full text-sm sm:text-base">
          <SelectValue placeholder={`Select ${question.label || question.title}`} />
        </SelectTrigger>
        <SelectContent>
          {question.selectOptions?.map((option, idx) => (
            <SelectItem key={option.id || idx} value={option.value || ""} className="text-sm sm:text-base">
              {option.value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
