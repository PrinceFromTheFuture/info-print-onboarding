"use client";

import React, { useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import type { Question } from "./types";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { debouncedFieldUpdate } from "@/lib/redux/formSlice/formSlice";
import { Textarea } from "@/components/ui/textarea";

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
  const hasInitialized = useRef(false);

  // Initialize with default value if value is empty and defaultValue exists
  useEffect(() => {
    if (!hasInitialized.current && !value && question.defaultValue) {
      hasInitialized.current = true;
      onChange?.(question.defaultValue);
      dispatch(debouncedFieldUpdate(question.id, question.defaultValue) as any);
    }
  }, [question.defaultValue, question.id, value, onChange, dispatch]);

  const handleChange = (newValue: string) => {
    // Call the onChange prop for compatibility
    onChange?.(newValue);

    // Dispatch the debounced update action
    dispatch(debouncedFieldUpdate(question.id, newValue) as any);
  };

  // Check if the value has been modified from the default
  const isModified = question.defaultValue && value !== question.defaultValue;
  // Use the provided value, or fall back to defaultValue, or empty string
  const displayValue = value || question.defaultValue || "";

  const rows = Math.ceil(displayValue.split("\n").length);

  return (
    <div className="space-y-2">
      <Label htmlFor={question.id} className="text-sm sm:text-base">
        {question.label || question.title}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="relative">
        <Textarea
          rows={rows}
          id={question.id}
          placeholder={`Enter ${question.label || question.title}`}
          value={displayValue}
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
