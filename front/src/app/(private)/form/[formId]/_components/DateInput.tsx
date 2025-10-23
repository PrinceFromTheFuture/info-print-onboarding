"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Question } from "./types";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setFieldValue, updateOrCreateSubmissionAsyncThunk } from "@/lib/redux/formSlice/formSlice";

interface DateInputProps {
  question: Question;
  value?: string;
  onChange?: (value: string) => void;
  isInvalid?: boolean;
}

export default function DateInput({ question, value = "", onChange }: DateInputProps) {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.form.questionLoadingStates[question.id]);
  const error = useAppSelector((state) => state.form.questionErrors[question.id]);
  const [date, setDate] = React.useState<Date | undefined>(value ? new Date(value) : undefined);

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      // Format date as YYYY-MM-DD for consistency
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      onChange?.(formattedDate);

      // Optimistically update and save immediately
      dispatch(setFieldValue({ questionId: question.id, value: formattedDate }));
      dispatch(updateOrCreateSubmissionAsyncThunk({ questionId: question.id, value: formattedDate }));
    } else {
      onChange?.("");
      dispatch(setFieldValue({ questionId: question.id, value: "" }));
      dispatch(updateOrCreateSubmissionAsyncThunk({ questionId: question.id, value: "" }));
    }
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
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={question.id}
            variant="outline"
            className={cn("w-full justify-start text-left font-normal text-sm sm:text-base", !date && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={date} onSelect={handleDateChange} initialFocus />
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
