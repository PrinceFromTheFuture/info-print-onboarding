"use client";

import React from "react";
import TextInput from "./TextInput";
import NumberInput from "./NumberInput";
import SelectInput from "./SelectInput";
import DateInput from "./DateInput";
import CheckboxInput from "./CheckboxInput";
import ImageInput from "./ImageInput";
import AttachmentInput from "./AttachmentInput";
import type { Question } from "./types";

interface QuestionRendererProps {
  question: Question;
  value?: any;
  onChange?: (value: any) => void;
  isInvalid?: boolean;
}

export default function QuestionRenderer({ question, value, onChange, isInvalid = false }: QuestionRendererProps) {
  switch (question.type) {
    case "text":
      return <TextInput question={question} value={value} onChange={onChange} isInvalid={isInvalid} />;
    case "number":
      return <NumberInput question={question} value={value} onChange={onChange} isInvalid={isInvalid} />;
    case "select":
      return <SelectInput question={question} value={value} onChange={onChange} isInvalid={isInvalid} />;
    case "date":
      return <DateInput question={question} value={value} onChange={onChange} isInvalid={isInvalid} />;
    case "checkbox":
      return <CheckboxInput question={question} value={value} onChange={onChange} isInvalid={isInvalid} />;
    case "image":
      return <ImageInput question={question} value={value} onChange={onChange} isInvalid={isInvalid} />;
    case "attachment":
      return <AttachmentInput question={question} value={value} onChange={onChange} isInvalid={isInvalid} />;
    default:
      return <TextInput question={question} value={value} onChange={onChange} isInvalid={isInvalid} />;
  }
}
