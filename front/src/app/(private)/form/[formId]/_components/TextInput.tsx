"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import type { Question } from "./types";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { debouncedFieldUpdate } from "@/lib/redux/formSlice/formSlice";

interface TextInputProps {
  question: Question;
  value?: string;
  onChange?: (value: string) => void;
  isInvalid?: boolean;
}

export default function TextInput({ question, value = "", onChange }: TextInputProps) {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.form.questionLoadingStates[question.id]);
  const error = useAppSelector((state) => state.form.questionErrors[question.id]);

  const handleChange = (newValue: string) => {
    // Call the onChange prop for compatibility
    onChange?.(newValue);

    // Dispatch the debounced update action
    dispatch(debouncedFieldUpdate(question.id, newValue) as any);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={question.id} className="text-sm sm:text-base">
        {question.label || question.title}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="relative">
        <Input
          id={question.id}
          type="text"
          placeholder={`Enter ${question.label || question.title}`}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          required={question.required || false}
          className="w-full text-sm sm:text-base pr-10"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
